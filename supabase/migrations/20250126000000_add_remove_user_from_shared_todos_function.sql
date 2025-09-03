-- Function to remove a user's email from all shared todos member_emails arrays
CREATE OR REPLACE FUNCTION remove_user_from_shared_todos(user_email_to_remove TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Remove the email from member_emails arrays in all shared todos
    UPDATE public.coop_todos_shared
    SET member_emails = array_remove(member_emails, user_email_to_remove)
    WHERE user_email_to_remove = ANY(member_emails);
    
    -- Log how many rows were affected
    RAISE NOTICE 'Removed email % from % shared todo tables', 
        user_email_to_remove, 
        (SELECT COUNT(*) FROM public.coop_todos_shared WHERE user_email_to_remove = ANY(member_emails));
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to the service role
GRANT EXECUTE ON FUNCTION remove_user_from_shared_todos(TEXT) TO service_role;
