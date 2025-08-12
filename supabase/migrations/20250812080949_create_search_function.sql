CREATE OR REPLACE FUNCTION search_todos(search_term TEXT, user_id_param UUID)
RETURNS TABLE(LIKE todos)
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM todos
  WHERE todos.user_id = user_id_param
    AND (
      todos.todo ILIKE '%' || search_term || '%' OR
      todos.todo_more_content ILIKE '%' || search_term || '%' OR
      todos.todo_date::text ILIKE '%' || search_term || '%'
    )
  ORDER BY todos.created_at DESC;
END;
$$ LANGUAGE plpgsql;