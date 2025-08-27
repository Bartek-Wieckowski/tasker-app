import { supabase } from "@/lib/supabaseClient";
import { handleImageDeletion } from "./apiTodos";
import { TodoInsert } from "@/types/types";
import { dateCustomFormatting } from "@/lib/helpers";

export async function getGlobalTodos(userId: string) {
  const { data, error } = await supabase
    .from("global_todos")
    .select("*")
    .eq("user_id", userId)
    .order("order_index", { ascending: true });

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
  // Get next order_index
  const { data: maxOrderData } = await supabase
    .from("global_todos")
    .select("order_index")
    .eq("user_id", userId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrderIndex =
    maxOrderData && maxOrderData.length > 0
      ? (maxOrderData[0].order_index || 0) + 1
      : 1;

  const { data, error } = await supabase
    .from("global_todos")
    .insert({
      todo: todo.todo,
      user_id: userId,
      order_index: nextOrderIndex,
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

  const formattedDate = dateCustomFormatting(todoDate);

  // Get next order_index for this date
  const { data: maxOrderData } = await supabase
    .from("todos")
    .select("order_index")
    .eq("user_id", userId)
    .eq("todo_date", formattedDate)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrderIndex =
    maxOrderData && maxOrderData.length > 0
      ? (maxOrderData[0].order_index || 0) + 1
      : 1;

  const todoData: TodoInsert = {
    user_id: userId,
    todo: globalTodo.todo,
    todo_more_content: globalTodo.todo_more_content,
    image_url: globalTodo.image_url,
    todo_date: formattedDate,
    is_completed: globalTodo.is_completed,
    original_todo_id: globalTodo.original_todo_id || globalTodo.id,
    is_independent_edit: false,
    from_delegated: false,
    created_at: globalTodo.created_at,
    updated_at: globalTodo.updated_at,
    order_index: nextOrderIndex,
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

  // If this was an original todo that had related todos, update their original_todo_id
  const oldOriginalTodoId = globalTodo.original_todo_id;
  if (oldOriginalTodoId && oldOriginalTodoId !== newTodo.id) {
    // Update the new todo to point to itself as original
    const { error: updateSelfError } = await supabase
      .from("todos")
      .update({ original_todo_id: newTodo.id })
      .eq("id", newTodo.id);

    if (updateSelfError && import.meta.env.DEV) {
      console.error("Failed to update self original_todo_id:", updateSelfError);
    }

    // Update all related todos to point to the new original
    const { error: updateRelatedError } = await supabase
      .from("todos")
      .update({ original_todo_id: newTodo.id })
      .eq("user_id", userId)
      .eq("original_todo_id", oldOriginalTodoId)
      .eq("is_independent_edit", false);

    if (updateRelatedError) {
      if (import.meta.env.DEV) {
        console.error(
          "Failed to update related todos original_todo_id:",
          updateRelatedError
        );
      }
    } else if (import.meta.env.DEV) {
      console.log("Updated related todos original_todo_id:", {
        oldOriginalTodoId,
        newOriginalTodoId: newTodo.id,
      });
    }
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

export async function updateGlobalTodosOrder(
  todoOrders: Array<{ id: string; order_index: number }>,
  userId: string
) {
  // Update each global todo's order_index
  const promises = todoOrders.map(({ id, order_index }) =>
    supabase
      .from("global_todos")
      .update({ order_index })
      .eq("id", id)
      .eq("user_id", userId)
  );

  const results = await Promise.all(promises);

  // Check if any update failed
  const failedUpdate = results.find((result) => result.error);
  if (failedUpdate?.error) {
    if (import.meta.env.DEV) {
      console.error({
        code: failedUpdate.error.code,
        message: failedUpdate.error.message,
      });
    }
    throw { code: "UPDATE_GLOBAL_TODOS_ORDER_ERROR" };
  }

  if (import.meta.env.DEV) {
    console.log("Global todos order updated successfully:", {
      updatedCount: todoOrders.length,
    });
  }
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
