import { supabase } from "@/lib/supabaseClient";

export async function getCyclicTodos(userId: string) {
  const { data, error } = await supabase
    .from("cyclic_todos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "GET_CYCLIC_TODOS_ERROR" };
  }

  return data;
}

export async function addCyclicTodo(todo: { todo: string }, userId: string) {
  const { data, error } = await supabase
    .from("cyclic_todos")
    .insert({
      todo: todo.todo,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "ADD_CYCLIC_TODO_ERROR" };
  }

  return data;
}

export async function editCyclicTodo(
  todoId: string,
  newTodoName: string,
  accountId: string
) {
  const { data, error } = await supabase
    .from("cyclic_todos")
    .update({ todo: newTodoName })
    .eq("id", todoId)
    .eq("user_id", accountId)
    .select()
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "EDIT_CYCLIC_TODO_ERROR" };
  }

  // Update all related todos in the todos table that reference this cyclic todo
  // Only update todos that haven't been independently edited
  const { error: updateRelatedError } = await supabase
    .from("todos")
    .update({ todo: newTodoName })
    .eq("original_todo_id", todoId)
    .eq("user_id", accountId)
    .eq("is_independent_edit", false);

  if (updateRelatedError) {
    if (import.meta.env.DEV) {
      console.error({
        code: updateRelatedError.code,
        message: updateRelatedError.message,
      });
    }
    // Log warning but don't throw - the cyclic todo was updated successfully
    console.warn("Failed to update related todos:", updateRelatedError.message);
  }

  return data;
}

export async function deleteCyclicTodo(todoId: string, accountId: string) {
  const { error: getTodoError } = await supabase
    .from("cyclic_todos")
    .select("*")
    .eq("id", todoId)
    .eq("user_id", accountId)
    .single();

  if (getTodoError) {
    if (import.meta.env.DEV) {
      console.error({
        code: getTodoError.code,
        message: getTodoError.message,
      });
    }
    throw { code: "GET_CYCLIC_TODO_ERROR" };
  }

  const { error } = await supabase
    .from("cyclic_todos")
    .delete()
    .eq("id", todoId)
    .eq("user_id", accountId);

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "DELETE_CYCLIC_TODO_ERROR" };
  }

  return { success: true };
}
