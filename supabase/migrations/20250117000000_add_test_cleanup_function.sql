CREATE OR REPLACE FUNCTION public.clean_test_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Czyść z aplikacyjnych tabel, np. db_users, profiles itp.
  DELETE FROM public.db_users
  WHERE email LIKE 'taskertestuser%@developedbybart.pl';

  -- Możesz dodać więcej, np.
  -- DELETE FROM public.user_profiles WHERE ...;
END;
$$;

-- Uprawnienia
GRANT EXECUTE ON FUNCTION public.clean_test_users() TO service_role;
