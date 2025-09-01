-- Enable pg_cron extension (może już być włączone w Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function that directly processes cyclic todos (without calling Edge Function)
-- This version uses exactly the same logic as Edge Function but runs inside the database
CREATE OR REPLACE FUNCTION process_cyclic_todos_internal()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  today_date text;
  cyclic_todo_record record;
  existing_todo_count integer;
  todos_to_create jsonb[] DEFAULT '{}';
  skipped_todos jsonb[] DEFAULT '{}';
  created_todos jsonb[] DEFAULT '{}';
  result_todo record;
  total_cyclic integer DEFAULT 0;
  processed_count integer DEFAULT 0;
  skipped_count integer DEFAULT 0;
BEGIN
  -- Get current date in YYYY-MM-DD format for Polish timezone (Europe/Warsaw)
  today_date := to_char((now() at time zone 'Europe/Warsaw')::date, 'YYYY-MM-DD');
  
  RAISE NOTICE '🔄 Starting cyclic todos processing for local (Europe/Warsaw) date: %', today_date;
  
  -- Count total cyclic todos
  SELECT COUNT(*) INTO total_cyclic FROM public.cyclic_todos;
  
  IF total_cyclic = 0 THEN
    RAISE NOTICE 'ℹ️  No cyclic todos found';
    RETURN jsonb_build_object(
      'success', true,
      'message', 'No cyclic todos to process',
      'processed', 0,
      'skipped', 0,
      'date', today_date,
      'total_cyclic_todos', 0
    );
  END IF;
  
  RAISE NOTICE '📝 Found % cyclic todos to process', total_cyclic;
  
  -- Process each cyclic todo
  FOR cyclic_todo_record IN 
    SELECT id, user_id, todo, created_at, updated_at 
    FROM public.cyclic_todos 
    ORDER BY created_at
  LOOP
    RAISE NOTICE '🔍 Checking cyclic todo: "%" for user %', 
      cyclic_todo_record.todo, cyclic_todo_record.user_id;
    
    -- Check if todo already exists for this user and today (local date)
    SELECT COUNT(*) INTO existing_todo_count
    FROM public.todos 
    WHERE user_id = cyclic_todo_record.user_id 
      AND todo_date = today_date::date 
      AND (
        todo = cyclic_todo_record.todo 
        OR original_todo_id = cyclic_todo_record.id
      );
    
    IF existing_todo_count = 0 THEN
      -- Create new todo
      RAISE NOTICE '➕ Will create: "%"', cyclic_todo_record.todo;
      
      INSERT INTO public.todos (
        user_id,
        todo,
        todo_more_content,
        image_url,
        is_completed,
        todo_date,
        created_at,
        from_delegated,
        is_independent_edit,
        original_todo_id
      ) VALUES (
        cyclic_todo_record.user_id,
        cyclic_todo_record.todo,
        NULL,
        NULL,
        false,
        today_date::date,
        NOW(),
        false,
        false,
        cyclic_todo_record.id
      ) RETURNING id, user_id, todo INTO result_todo;
      
      -- Add to created todos array
      created_todos := created_todos || jsonb_build_object(
        'id', result_todo.id,
        'user_id', result_todo.user_id,
        'todo', result_todo.todo
      );
      
      processed_count := processed_count + 1;
      
    ELSE
      RAISE NOTICE '⏭️  Skipping: "%" (already exists for today or manually repeated)', cyclic_todo_record.todo;
      
      -- Add to skipped todos array
      skipped_todos := skipped_todos || jsonb_build_object(
        'user_id', cyclic_todo_record.user_id,
        'todo', cyclic_todo_record.todo,
        'reason', 'already_exists_or_manually_repeated'
      );
      
      skipped_count := skipped_count + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Processing complete. Created: %, Skipped: %', processed_count, skipped_count;
  
  -- Return comprehensive result
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully processed cyclic todos',
    'processed', processed_count,
    'skipped', skipped_count,
    'date', today_date,
    'details', jsonb_build_object(
      'total_cyclic_todos', total_cyclic,
      'created_todos', array_to_json(created_todos),
      'skipped_todos', array_to_json(skipped_todos)
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '💥 Error in process_cyclic_todos_internal: %', SQLERRM;
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'timestamp', NOW()
    );
END;
$$;

-- Function for manual testing (available for authenticated users)
CREATE OR REPLACE FUNCTION manually_process_cyclic_todos()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN process_cyclic_todos_internal();
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION process_cyclic_todos_internal() TO service_role;
GRANT EXECUTE ON FUNCTION manually_process_cyclic_todos() TO authenticated;

-- Schedule the function to run daily at 00:01 UTC (logic inside function converts to local time)
SELECT cron.schedule(
  'process-cyclic-todos-daily',
  '1 0 * * *', -- Every day at 00:01 UTC
  'SELECT process_cyclic_todos_internal();'
);

-- ===== Functions for local testing =====

-- Function for testing with custom interval (only for development)
CREATE OR REPLACE FUNCTION setup_cyclic_todos_test_cron(interval_minutes integer DEFAULT 1)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  cron_expression text;
  job_name text := 'process-cyclic-todos-test';
BEGIN
  -- Remove existing test job if it exists
  PERFORM cron.unschedule(job_name);
  
  -- Create cron expression based on minutes
  IF interval_minutes = 1 THEN
    cron_expression := '* * * * *'; -- every minute
  ELSIF interval_minutes = 5 THEN
    cron_expression := '*/5 * * * *'; -- every 5 minutes
  ELSIF interval_minutes = 10 THEN
    cron_expression := '*/10 * * * *'; -- every 10 minutes
  ELSE
    cron_expression := format('*/%s * * * *', interval_minutes); -- every X minutes
  END IF;
  
  -- Schedule test job
  PERFORM cron.schedule(
    job_name,
    cron_expression,
    'SELECT process_cyclic_todos_internal();'
  );
  
  RETURN format('✅ Test cron job scheduled to run every %s minute(s)', interval_minutes);
END;
$$;

-- Function to stop test cron
CREATE OR REPLACE FUNCTION stop_cyclic_todos_test_cron()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM cron.unschedule('process-cyclic-todos-test');
  RETURN '🛑 Test cron job stopped';
END;
$$;

-- Grant permissions for test functions
GRANT EXECUTE ON FUNCTION setup_cyclic_todos_test_cron(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION stop_cyclic_todos_test_cron() TO authenticated;

-- Function to check the status of all cron jobs
CREATE OR REPLACE FUNCTION check_cron_jobs_status()
RETURNS TABLE(
  job_name text,
  schedule text,
  command text,
  active boolean,
  last_run_started_at timestamptz,
  last_run_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.jobname::text,
    j.schedule::text,
    j.command::text,
    j.active,
    r.start_time as last_run_started_at,
    CASE 
      WHEN r.status = 'succeeded' THEN '✅ Success'
      WHEN r.status = 'failed' THEN '❌ Failed'
      WHEN r.status = 'running' THEN '🔄 Running'
      ELSE '❓ Unknown'
    END as last_run_status
  FROM cron.job j
  LEFT JOIN LATERAL (
    SELECT status, start_time
    FROM cron.job_run_details
    WHERE jobid = j.jobid
    ORDER BY start_time DESC
    LIMIT 1
  ) r ON true
  WHERE j.jobname LIKE '%cyclic-todos%'
  ORDER BY j.jobname;
END;
$$;

GRANT EXECUTE ON FUNCTION check_cron_jobs_status() TO authenticated;
