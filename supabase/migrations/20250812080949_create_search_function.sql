CREATE OR REPLACE FUNCTION search_todos(search_term TEXT, user_id_param UUID)
RETURNS TABLE(LIKE public.todos)
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.todos
  WHERE public.todos.user_id = user_id_param
    AND (
      public.todos.todo ILIKE '%' || search_term || '%' OR
      public.todos.todo_more_content ILIKE '%' || search_term || '%' OR
      public.todos.todo_date::text ILIKE '%' || search_term || '%'
    )
  ORDER BY public.todos.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to the search function
GRANT ALL ON FUNCTION search_todos(TEXT, UUID) TO authenticated;