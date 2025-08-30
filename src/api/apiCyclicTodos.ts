import { supabase } from "@/lib/supabaseClient";

export async function getCyclicTodos(userId: string) {
  const { data, error } = await supabase
    .from("cyclic_todos")
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
    throw { code: "GET_CYCLIC_TODOS_ERROR" };
  }

  return data;
}

export async function addCyclicTodo(todo: { todo: string }, userId: string) {
  // Get next order_index
  const { data: maxOrderData } = await supabase
    .from("cyclic_todos")
    .select("order_index")
    .eq("user_id", userId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrderIndex =
    maxOrderData && maxOrderData.length > 0
      ? (maxOrderData[0].order_index || 0) + 1
      : 1;

  const { data, error } = await supabase
    .from("cyclic_todos")
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

export async function updateCyclicTodosOrder(
  todoOrders: Array<{ id: string; order_index: number }>,
  userId: string
) {
  // Update each cyclic todo's order_index
  const promises = todoOrders.map(({ id, order_index }) =>
    supabase
      .from("cyclic_todos")
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
    throw { code: "UPDATE_CYCLIC_TODOS_ORDER_ERROR" };
  }

  if (import.meta.env.DEV) {
    console.log("Cyclic todos order updated successfully:", {
      updatedCount: todoOrders.length,
    });
  }
}
