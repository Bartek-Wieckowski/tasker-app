-- POPRAWIONA migracja cron - zawsze 19:00 czasu Warsaw

-- Włącz wymagane rozszerzenia
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Skonfiguruj dostęp do funkcji HTTP - UPROSZCZONA WERSJA
DO $$
DECLARE
  ext_schema text;
  func_exists boolean := false;
BEGIN
  -- Stwórz schemat net jeśli nie istnieje
  CREATE SCHEMA IF NOT EXISTS net;
  
  -- Znajdź w którym schemacie są funkcje http_post
  SELECT n.nspname INTO ext_schema
  FROM pg_proc p 
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE p.proname = 'http_post'
  LIMIT 1;
  
  -- Sprawdź czy net.http_post już istnieje
  SELECT EXISTS(
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'net' AND p.proname = 'http_post'
  ) INTO func_exists;
  
  IF ext_schema IS NULL THEN
    -- Brak funkcji http - spróbuj zainstalować rozszerzenie
    BEGIN
      CREATE EXTENSION IF NOT EXISTS http;
      RAISE NOTICE 'Rozszerzenie http zainstalowane';
      -- Sprawdź ponownie gdzie wylądowało
      SELECT n.nspname INTO ext_schema
      FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE p.proname = 'http_post'
      LIMIT 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Nie udało się zainstalować rozszerzenia http: % %', SQLSTATE, SQLERRM;
        RETURN; -- Wyjdź jeśli nie możemy zainstalować
    END;
  END IF;
  
  -- Jeśli funkcje nie są w net, stwórz aliasy
  IF ext_schema IS NOT NULL AND ext_schema != 'net' AND NOT func_exists THEN
    BEGIN
      EXECUTE format('
        CREATE OR REPLACE FUNCTION net.http_post(
          url text,
          headers jsonb DEFAULT NULL,
          body jsonb DEFAULT NULL
        ) RETURNS jsonb
        LANGUAGE sql SECURITY DEFINER
        AS $func$ SELECT %I.http_post($1, $2::text, $3::text)::jsonb $func$;
      ', ext_schema);
      
      EXECUTE format('
        CREATE OR REPLACE FUNCTION net.http_get(
          url text,
          headers jsonb DEFAULT NULL
        ) RETURNS jsonb
        LANGUAGE sql SECURITY DEFINER
        AS $func$ SELECT %I.http_get($1, $2::text)::jsonb $func$;
      ', ext_schema);
      
      RAISE NOTICE 'Funkcje proxy utworzone: net.http_post, net.http_get -> %.http_*', ext_schema;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Błąd podczas tworzenia funkcji proxy: % %', SQLSTATE, SQLERRM;
    END;
  ELSIF func_exists THEN
    RAISE NOTICE 'Funkcje net.http_* już istnieją';
  ELSE
    RAISE NOTICE 'Funkcje http są już w schemacie net';
  END IF;
  
END $$;

-- Usuń istniejący job
DO $$
BEGIN
  PERFORM cron.unschedule('daily-todo-notifications');
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Job daily-todo-notifications nie istnieje, pomijam usuwanie';
END $$;

-- ✅ Cron job ustawiony na 19:00 czasu Warsaw (17:00 UTC)
SELECT cron.schedule(
  'daily-todo-notifications',
  '0 17 * * *', -- 17:00 UTC → 19:00 Europe/Warsaw (lato), 18:00 (zima)
  $$
  SELECT
    net.http_post(
      url := 'https://slktbcjeorvwagukcvmw.supabase.co/functions/v1/send_daily_notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.default', true)
      ),
      body := jsonb_build_object(
        'cron_trigger', true,
        'triggered_at', (now() at time zone 'Europe/Warsaw')::text
      )
    ) as request_id;
  $$
);

-- ✅ Funkcja do manualnego testowania (lokalnie)
CREATE OR REPLACE FUNCTION manually_trigger_daily_notifications()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  response_status integer;
  response_body text;
BEGIN
  SELECT 
    net.http_post(
      url := 'http://127.0.0.1:54321/functions/v1/send_daily_notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
      ),
      body := jsonb_build_object(
        'manual_trigger', true,
        'test_mode', true,
        'timestamp', (now() at time zone 'Europe/Warsaw')::text
      )
    ) INTO result;
  
  response_status := (result->'status')::integer;
  response_body := result->>'body';
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Manual trigger executed (LOCAL)',
    'response_status', response_status,
    'response_body', response_body,
    'full_response', result,
    'timestamp', (now() at time zone 'Europe/Warsaw')
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE,
      'timestamp', (now() at time zone 'Europe/Warsaw')
    );
END;
$$;

-- ✅ Funkcja do manualnego testowania NA PRODUKCJI
CREATE OR REPLACE FUNCTION manually_trigger_daily_notifications_in_production()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  response_status integer;
  response_body text;
BEGIN
  SELECT 
    net.http_post(
      url := 'https://slktbcjeorvwagukcvmw.supabase.co/functions/v1/send_daily_notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.default', true)
      ),
      body := jsonb_build_object(
        'manual_trigger', true,
        'test_mode', false,
        'production_test', true,
        'timestamp', (now() at time zone 'Europe/Warsaw')::text
      )
    ) INTO result;
  
  response_status := (result->'status')::integer;
  response_body := result->>'body';
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Manual trigger executed on PRODUCTION',
    'response_status', response_status,
    'response_body', response_body,
    'full_response', result,
    'timestamp', (now() at time zone 'Europe/Warsaw')
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE,
      'timestamp', (now() at time zone 'Europe/Warsaw')
    );
END;
$$;

-- ✅ Healthcheck Edge Function
CREATE OR REPLACE FUNCTION test_edge_function_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT 
    net.http_get(
      url := 'http://127.0.0.1:54321/functions/v1/send_daily_notifications',
      headers := jsonb_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
      )
    ) INTO result;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Health check completed',
    'response', result,
    'timestamp', (now() at time zone 'Europe/Warsaw')
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Edge Function nie odpowiada - sprawdź czy supabase functions serve jest uruchomione',
      'timestamp', (now() at time zone 'Europe/Warsaw')
    );
END;
$$;

-- ✅ Funkcja do sprawdzania danych testowych
CREATE OR REPLACE FUNCTION check_test_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count integer;
  todo_count integer;
  incomplete_todo_count integer;
  subscription_count integer;
  today_date date := (now() at time zone 'Europe/Warsaw')::date;
BEGIN
  SELECT COUNT(*) INTO user_count FROM db_users;
  SELECT COUNT(*) INTO todo_count FROM todos;
  SELECT COUNT(*) INTO incomplete_todo_count 
  FROM todos 
  WHERE todo_date = today_date AND is_completed = false;
  SELECT COUNT(*) INTO subscription_count FROM push_subscriptions WHERE is_active = true;
  
  RETURN jsonb_build_object(
    'users', user_count,
    'todos_total', todo_count,
    'todos_incomplete_today', incomplete_todo_count,
    'active_subscriptions', subscription_count,
    'today_date', today_date,
    'ready_for_notifications', (user_count > 0 AND incomplete_todo_count > 0 AND subscription_count > 0),
    'timestamp', (now() at time zone 'Europe/Warsaw')
  );
END;
$$;

-- ✅ Cron status checker
CREATE OR REPLACE FUNCTION check_daily_notifications_cron_status()
RETURNS TABLE(
  job_name text,
  schedule text,
  command text,
  active boolean,
  last_run_started_at timestamptz,
  last_run_status text,
  next_run_time timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.jobname::text,
    j.schedule::text,
    LEFT(j.command::text, 100) || '...' as command,
    j.active,
    r.start_time as last_run_started_at,
    CASE 
      WHEN r.status = 'succeeded' THEN '✅ Success'
      WHEN r.status = 'failed' THEN '❌ Failed'
      WHEN r.status = 'running' THEN '🔄 Running'
      ELSE '❓ Unknown'
    END as last_run_status,
    CASE 
      WHEN EXTRACT(hour FROM (now() at time zone 'UTC')) < 17 THEN
        ((CURRENT_DATE at time zone 'UTC') + INTERVAL '17 hours')
      ELSE
        (((CURRENT_DATE + INTERVAL '1 day') at time zone 'UTC') + INTERVAL '17 hours')
    END as next_run_time
  FROM cron.job j
  LEFT JOIN LATERAL (
    SELECT status, start_time
    FROM cron.job_run_details
    WHERE jobid = j.jobid
    ORDER BY start_time DESC
    LIMIT 1
  ) r ON true
  WHERE j.jobname = 'daily-todo-notifications'
  ORDER BY j.jobname;
END;
$$;

-- ✅ Enable/disable cron
CREATE OR REPLACE FUNCTION toggle_daily_notifications_cron(enable_job boolean DEFAULT true)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF enable_job THEN
    UPDATE cron.job SET active = true WHERE jobname = 'daily-todo-notifications';
    RETURN '✅ Daily notifications cron job enabled';
  ELSE
    UPDATE cron.job SET active = false WHERE jobname = 'daily-todo-notifications';
    RETURN '🛑 Daily notifications cron job disabled';
  END IF;
END;
$$;

-- Uprawnienia
GRANT EXECUTE ON FUNCTION check_daily_notifications_cron_status() TO authenticated;
GRANT EXECUTE ON FUNCTION manually_trigger_daily_notifications() TO authenticated;
GRANT EXECUTE ON FUNCTION manually_trigger_daily_notifications_in_production() TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_daily_notifications_cron(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION test_edge_function_health() TO authenticated;
GRANT EXECUTE ON FUNCTION check_test_data() TO authenticated;

-- ✅ Instrukcje testowania
DO $$
BEGIN
  RAISE NOTICE '🔧 TESTING CHECKLIST:';
  RAISE NOTICE '1. SELECT check_test_data(); -- Sprawdź czy masz testowe dane';
  RAISE NOTICE '2. SELECT test_edge_function_health(); -- Sprawdź czy Edge Function odpowiada (LOCAL)';
  RAISE NOTICE '3. SELECT manually_trigger_daily_notifications(); -- Przetestuj wysyłanie (LOCAL)';
  RAISE NOTICE '4. SELECT manually_trigger_daily_notifications_in_production(); -- Przetestuj wysyłanie (PRODUKCJA)';
  RAISE NOTICE '5. SELECT * FROM notification_logs ORDER BY created_at DESC; -- Sprawdź logi';
  RAISE NOTICE '6. SELECT * FROM check_daily_notifications_cron_status(); -- Status cron';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 PRODUCTION TEST:';
  RAISE NOTICE 'SELECT manually_trigger_daily_notifications_in_production(); -- Testuj na produkcji';
END $$;
