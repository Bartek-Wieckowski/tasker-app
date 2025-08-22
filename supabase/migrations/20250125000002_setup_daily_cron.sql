-- 1️⃣ Rozszerzenia
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA vault;

-- 2️⃣ Usuń stary cron (jeśli istnieje)
DO $$
BEGIN
  PERFORM cron.unschedule('daily-todo-notifications');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Job daily-todo-notifications nie istnieje, pomijam';
END $$;

-- 3️⃣ Funkcja triggerująca Edge Function
CREATE OR REPLACE FUNCTION trigger_daily_notifications(is_production boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resp record;
  target_url text;
  auth_header text;
  vault_secret text;
BEGIN
  -- Wybór URL i klucza w zależności od środowiska
  IF is_production THEN
    target_url := 'https://slktbcjeorvwagukcvmw.supabase.co/functions/v1/send_daily_notifications';
    
    -- Pobierz secret z Supabase Vault
    SELECT decrypted_secret INTO vault_secret 
    FROM vault.decrypted_secrets 
    WHERE name = 'notification-send' 
    LIMIT 1;
    
    IF vault_secret IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Secret "notification-send" not found in Vault',
        'help', 'Add secret "notification-send" in Supabase Dashboard → Settings → Vault',
        'timestamp', now()
      );
    END IF;
    
    auth_header := 'Bearer ' || vault_secret;
  ELSE
    target_url := 'http://127.0.0.1:54321/functions/v1/send_daily_notifications';
    auth_header := 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
  END IF;
  
  -- HTTP request z Authorization header
  SELECT INTO resp * FROM net.http_post(
    url := target_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', auth_header
    ),
    body := jsonb_build_object('manual_trigger', true, 'timestamp', now()::text)
  );

  RETURN jsonb_build_object(
    'success', true,
    'response', resp,
    'timestamp', now()
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'error_detail', SQLSTATE,
    'timestamp', now()
  );
END;
$$;

-- 4️⃣ Cron 19:00 Warsaw (17:00 UTC)
SELECT cron.schedule(
  'daily-todo-notifications',
  '0 17 * * *',
  'SELECT trigger_daily_notifications(true);'
);

-- 5️⃣ Granty dla authenticated
GRANT EXECUTE ON FUNCTION trigger_daily_notifications(boolean) TO authenticated;

-- 6️⃣ Instrukcje testowe
-- Test manualny:
-- SELECT trigger_daily_notifications(true);

-- Sprawdzenie logów powiadomień:
-- SELECT * FROM notification_logs ORDER BY sent_at DESC;

-- Cron status:
-- SELECT * FROM cron.job WHERE jobname = 'daily-todo-notifications';
