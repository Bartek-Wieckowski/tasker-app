import { supabase } from "@/lib/supabaseClient";
import { handleImageDeletion } from "./apiTodos";
import { TodoInsert } from "@/types/types";
import { dateCustomFormatting } from "@/lib/helpers";

export async function getGlobalTodos(userId: string) {
  const { data, error } = await supabase
    .from("global_todos")
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
    throw { code: "GET_GLOBAL_TODOS_ERROR" };
  }

  return data;
}

export async function addGlobalTodo(todo: { todo: string }, userId: string) {
  const { data, error } = await supabase
    .from("global_todos")
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
    throw { code: "ADD_GLOBAL_TODO_ERROR" };
  } else {
    const { error: updateOriginalTodoIdError } = await supabase
      .from("global_todos")
      .update({ original_todo_id: data.id })
      .eq("id", data.id);

    if (updateOriginalTodoIdError) {
      if (import.meta.env.DEV) {
        console.error({
          code: updateOriginalTodoIdError.code,
          message: updateOriginalTodoIdError.message,
        });
      }
      throw { code: "UPDATE_GLOBAL_TODO_ERROR" };
    }
  }

  return data;
}

export async function assignGlobalTodoToDay(
  globalTodoId: string,
  todoDate: Date,
  userId: string
) {
  const { data: globalTodo, error: getTodoError } = await supabase
    .from("global_todos")
    .select("*")
    .eq("id", globalTodoId)
    .eq("user_id", userId)
    .single();

  if (getTodoError) {
    if (import.meta.env.DEV) {
      console.error({
        code: getTodoError.code,
        message: getTodoError.message,
      });
    }
    throw { code: "GET_GLOBAL_TODO_ERROR" };
  }

  if (!globalTodo) {
    throw { code: "GLOBAL_TODO_NOT_FOUND" };
  }

  const todoData: TodoInsert = {
    user_id: userId,
    todo: globalTodo.todo,
    todo_more_content: globalTodo.todo_more_content,
    image_url: globalTodo.image_url,
    todo_date: dateCustomFormatting(todoDate),
    is_completed: globalTodo.is_completed,
    original_todo_id: globalTodo.original_todo_id || globalTodo.id,
    is_independent_edit: false,
    from_delegated: false,
    created_at: globalTodo.created_at,
    updated_at: globalTodo.updated_at,
  };

  const { data: newTodo, error: insertError } = await supabase
    .from("todos")
    .insert(todoData)
    .select()
    .single();

  if (insertError) {
    if (import.meta.env.DEV) {
      console.error({
        code: insertError.code,
        message: insertError.message,
      });
    }
    throw { code: "CREATE_TODO_ERROR" };
  }

  const { error: deleteError } = await supabase
    .from("global_todos")
    .delete()
    .eq("id", globalTodoId)
    .eq("user_id", userId);

  if (deleteError) {
    if (import.meta.env.DEV) {
      console.error({
        code: deleteError.code,
        message: deleteError.message,
      });
    }

    await supabase
      .from("todos")
      .delete()
      .eq("id", newTodo.id)
      .eq("user_id", userId);

    throw { code: "DELETE_GLOBAL_TODO_ERROR" };
  }

  if (import.meta.env.DEV) {
    console.log("Global todo assigned to day successfully:", {
      globalId: globalTodoId,
      newTodoId: newTodo.id,
      todoDate,
      hasImage: !!globalTodo.image_url,
    });
  }

  return newTodo;
}

export async function editGlobalTodo(
  todoId: string,
  newTodoName: string,
  accountId: string
) {
  const { data, error } = await supabase
    .from("global_todos")
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
    throw { code: "EDIT_GLOBAL_TODO_ERROR" };
  }

  return data;
}

export async function deleteGlobalTodo(todoId: string, accountId: string) {
  const { data: todo, error: getTodoError } = await supabase
    .from("global_todos")
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
    throw { code: "GET_GLOBAL_TODO_ERROR" };
  }

  if (todo?.image_url) {
    await handleImageDeletion(accountId, todo.image_url, todoId);
  }

  const { error } = await supabase
    .from("global_todos")
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
    throw { code: "DELETE_GLOBAL_TODO_ERROR" };
  }

  return { success: true };
}
