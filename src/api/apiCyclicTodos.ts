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
  } else {
    const { error: updateOriginalTodoIdError } = await supabase
      .from("cyclic_todos")
      .update({ todo: data.todo })
      .eq("id", data.id);

    if (updateOriginalTodoIdError) {
      if (import.meta.env.DEV) {
        console.error({
          code: updateOriginalTodoIdError.code,
          message: updateOriginalTodoIdError.message,
        });
      }
      throw { code: "UPDATE_CYCLIC_TODO_ERROR" };
    }
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
