import { supabase } from "@/lib/supabaseClient";
import { handleImageDeletion } from "./apiTodos";
import { TodoInsert } from "@/types/types";
import { dateCustomFormatting } from "@/lib/helpers";

export async function getDelegatedTodos(userId: string) {
  const { data, error } = await supabase
    .from("delegated_todos")
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
    throw { code: "GET_DELEGATED_TODOS_ERROR" };
  }

  return data;
}

export async function addDelegatedTodo(todo: { todo: string }, userId: string) {
  const { data, error } = await supabase
    .from("delegated_todos")
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
    throw { code: "ADD_DELEGATED_TODO_ERROR" };
  } else {
    const { error: updateOriginalTodoIdError } = await supabase
      .from("delegated_todos")
      .update({ original_todo_id: data.id })
      .eq("id", data.id);

    if (updateOriginalTodoIdError) {
      if (import.meta.env.DEV) {
        console.error({
          code: updateOriginalTodoIdError.code,
          message: updateOriginalTodoIdError.message,
        });
      }
      throw { code: "UPDATE_DELEGATED_TODO_ERROR" };
    }
  }

  return data;
}

export async function assignDelegatedTodoToDay(
  delegatedTodoId: string,
  todoDate: Date,
  userId: string
) {
  const { data: delegatedTodo, error: getTodoError } = await supabase
    .from("delegated_todos")
    .select("*")
    .eq("id", delegatedTodoId)
    .eq("user_id", userId)
    .single();

  if (getTodoError) {
    if (import.meta.env.DEV) {
      console.error({
        code: getTodoError.code,
        message: getTodoError.message,
      });
    }
    throw { code: "GET_DELEGATED_TODO_ERROR" };
  }

  if (!delegatedTodo) {
    throw { code: "DELEGATED_TODO_NOT_FOUND" };
  }

  const todoData: TodoInsert = {
    user_id: userId,
    todo: delegatedTodo.todo,
    todo_more_content: delegatedTodo.todo_more_content,
    image_url: delegatedTodo.image_url,
    todo_date: dateCustomFormatting(todoDate),
    is_completed: delegatedTodo.is_completed,
    original_todo_id: delegatedTodo.original_todo_id || delegatedTodo.id,
    is_independent_edit: false,
    from_delegated: true,
    created_at: delegatedTodo.created_at,
    updated_at: delegatedTodo.updated_at,
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
    .from("delegated_todos")
    .delete()
    .eq("id", delegatedTodoId)
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

    throw { code: "DELETE_DELEGATED_TODO_ERROR" };
  }

  if (import.meta.env.DEV) {
    console.log("Delegated todo assigned to day successfully:", {
      delegatedId: delegatedTodoId,
      newTodoId: newTodo.id,
      todoDate,
      hasImage: !!delegatedTodo.image_url,
    });
  }

  return newTodo;
}

export async function editDelegatedTodo(
  todoId: string,
  newTodoName: string,
  accountId: string
) {
  const { data, error } = await supabase
    .from("delegated_todos")
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
    throw { code: "EDIT_DELEGATED_TODO_ERROR" };
  }

  return data;
}

export async function deleteDelegatedTodo(todoId: string, accountId: string) {
  const { data: todo, error: getTodoError } = await supabase
    .from("delegated_todos")
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
    throw { code: "GET_DELEGATED_TODO_ERROR" };
  }

  if (todo?.image_url) {
    await handleImageDeletion(accountId, todo.image_url, todoId);
  }

  const { error } = await supabase
    .from("delegated_todos")
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
    throw { code: "DELETE_DELEGATED_TODO_ERROR" };
  }

  return { success: true };
}
