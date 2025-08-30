import { supabase } from "@/lib/supabaseClient";

export async function createSharedTodosTable(
  tableName: string,
  description?: string
) {
  const { data, error } = await supabase.rpc("create_shared_todos_table", {
    p_table_name: tableName,
    p_description: description,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "CREATE_SHARED_TODOS_TABLE_ERROR" };
  }

  return data;
}

export async function inviteToSharedTable(
  sharedTableId: string,
  inviteeEmail: string
) {
  const { data, error } = await supabase.rpc("invite_to_shared_table", {
    p_shared_table_id: sharedTableId,
    p_invitee_email: inviteeEmail,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "INVITE_TO_SHARED_TABLE_ERROR" };
  }

  return data;
}

export async function getMySharedTables() {
  const { data, error } = await supabase
    .from("my_shared_tables")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "GET_MY_SHARED_TABLES_ERROR" };
  }

  return data || [];
}

export async function getMyAccessibleTodos() {
  const { data, error } = await supabase
    .from("my_accessible_todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "GET_MY_ACCESSIBLE_TODOS_ERROR" };
  }

  return data || [];
}

export async function getCoopTodosByTableId(sharedTableId: string) {
  const { data, error } = await supabase
    .from("my_accessible_todos")
    .select("*")
    .eq("shared_table_id", sharedTableId)
    .order("order_index", { ascending: true });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "GET_COOP_TODOS_BY_TABLE_ID_ERROR" };
  }

  return data || [];
}

export async function getMyPendingInvitations() {
  const { data, error } = await supabase
    .from("my_pending_invitations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "GET_MY_PENDING_INVITATIONS_ERROR" };
  }

  return data || [];
}

export async function getMySentInvitations() {
  const { data, error } = await supabase
    .from("my_sent_invitations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "GET_MY_SENT_INVITATIONS_ERROR" };
  }

  return data || [];
}

export async function getMyReceivedInvitations() {
  const { data, error } = await supabase
    .from("my_received_invitations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "GET_MY_RECEIVED_INVITATIONS_ERROR" };
  }

  return data || [];
}

export async function acceptInvitation(invitationId: string) {
  const { data, error } = await supabase.rpc("accept_invitation", {
    p_invitation_id: invitationId,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "ACCEPT_INVITATION_ERROR" };
  }

  return data;
}

export async function declineInvitation(invitationId: string) {
  const { data, error } = await supabase.rpc("decline_invitation", {
    p_invitation_id: invitationId,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "DECLINE_INVITATION_ERROR" };
  }

  return data;
}

export async function leaveSharedTable(
  sharedTableId: string,
  emailToRemove?: string
) {
  const { data, error } = await supabase.rpc("leave_shared_table", {
    p_shared_table_id: sharedTableId,
    p_email_to_remove: emailToRemove,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "LEAVE_SHARED_TABLE_ERROR" };
  }

  return data;
}

export async function createCoopTodo(
  sharedTableId: string,
  todo: string,
  todoMoreContent?: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    throw new Error("Użytkownik nie jest zalogowany");
  }

  // Get next order_index for this shared table
  const { data: maxOrderData } = await supabase
    .from("coop_todos")
    .select("order_index")
    .eq("shared_table_id", sharedTableId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrderIndex =
    maxOrderData && maxOrderData.length > 0
      ? (maxOrderData[0].order_index || 0) + 1
      : 1;

  const { data, error } = await supabase
    .from("coop_todos")
    .insert({
      shared_table_id: sharedTableId,
      creator_user_id: user.id,
      todo,
      todo_more_content: todoMoreContent,
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
    throw { code: "CREATE_COOP_TODO_ERROR" };
  }

  return data;
}

export async function updateCoopTodoStatus(
  todoId: string,
  isCompleted: boolean
) {
  const { data, error } = await supabase
    .from("coop_todos")
    .update({ is_completed: isCompleted })
    .eq("id", todoId)
    .select()
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "UPDATE_COOP_TODO_STATUS_ERROR" };
  }

  return data;
}

export async function updateCoopTodo(
  todoId: string,
  todo: string,
  todoMoreContent?: string
) {
  const { data, error } = await supabase
    .from("coop_todos")
    .update({
      todo,
      todo_more_content: todoMoreContent || null,
    })
    .eq("id", todoId)
    .select()
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "UPDATE_COOP_TODO_ERROR" };
  }

  return data;
}

export async function deleteCoopTodo(todoId: string) {
  const { error } = await supabase.from("coop_todos").delete().eq("id", todoId);

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "DELETE_COOP_TODO_ERROR" };
  }
}

export async function deleteSharedTable(sharedTableId: string) {
  const { error } = await supabase
    .from("coop_todos_shared")
    .delete()
    .eq("id", sharedTableId);

  if (error) {
    if (import.meta.env.DEV) {
      console.error("Delete shared table error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        sharedTableId,
      });
    }
    throw { code: "DELETE_SHARED_TABLE_ERROR", error };
  }
}

export async function updateSharedTable(
  sharedTableId: string,
  tableName: string,
  description?: string
) {
  const { data, error } = await supabase
    .from("coop_todos_shared")
    .update({
      table_name: tableName,
      description: description || null,
    })
    .eq("id", sharedTableId)
    .select()
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "UPDATE_SHARED_TABLE_ERROR" };
  }

  return data;
}

export async function updateCoopTodosOrder(
  todoOrders: Array<{ id: string; order_index: number }>,
  sharedTableId: string
) {
  // Update each coop todo's order_index
  const promises = todoOrders.map(({ id, order_index }) =>
    supabase
      .from("coop_todos")
      .update({ order_index })
      .eq("id", id)
      .eq("shared_table_id", sharedTableId)
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
    throw { code: "UPDATE_COOP_TODOS_ORDER_ERROR" };
  }

  if (import.meta.env.DEV) {
    console.log("Coop todos order updated successfully:", {
      updatedCount: todoOrders.length,
      sharedTableId,
    });
  }
}

export async function getSharedTableById(sharedTableId: string) {
  const { data, error } = await supabase
    .from("my_shared_tables")
    .select("*")
    .eq("id", sharedTableId)
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "GET_SHARED_TABLE_BY_ID_ERROR" };
  }

  return data;
}
