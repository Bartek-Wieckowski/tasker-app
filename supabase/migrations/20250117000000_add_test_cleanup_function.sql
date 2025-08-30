CREATE OR REPLACE FUNCTION public.clean_test_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
set search_path = ''
AS $$
BEGIN
  -- Clean up test users from application tables, e.g. db_users, profiles, etc.
  DELETE FROM public.db_users
  WHERE email LIKE 'taskertestuser%@developedbybart.pl';

  -- You can add more, e.g.
  -- DELETE FROM public.user_profiles WHERE ...;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION public.clean_test_users() TO service_role;
