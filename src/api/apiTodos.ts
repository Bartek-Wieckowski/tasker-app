import { supabase } from "@/lib/supabaseClient";
import {
  TodoInsertWithFile,
  TodoInsert,
  User,
  TodoUpdateDetails,
  TodoRow,
} from "@/types/types";

export async function getUserTodos(accountId: string) {
  const { data: todos, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", accountId)
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "GET_USER_TODOS_ERROR" };
  }

  return todos;
}

export async function getTodosFromDay(selectedDate: string, currentUser: User) {
  const { data: todos, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", currentUser.accountId)
    .eq("todo_date", selectedDate)
    .order("created_at", { ascending: false });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "GET_TODOS_FROM_DAY_ERROR" };
  }

  return todos;
  //   return todos || [];
}

export async function getTodoById(todoId: string, currentUser: User) {
  const { data: todo, error } = await supabase
    .from("todos")
    .select("*")
    .eq("id", todoId)
    .eq("user_id", currentUser.accountId)
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "GET_TODO_BY_ID_ERROR" };
  }

  return todo;
}

export async function searchTodos(searchTerm: string, currentUser: User) {
  const { data: todos, error } = await supabase.rpc("search_todos", {
    search_term: searchTerm,
    user_id_param: currentUser.accountId,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "SEARCH_TODOS_ERROR" };
  }

  return todos;
  //   return todos || []
}

export async function uploadImageAndGetUrl(
  accountId: string,
  todoId: string,
  image: File
) {
  const fileExt = image.name.split(".").pop();
  const timestamp = Date.now();
  const filePath = `${accountId}/${todoId}_${timestamp}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("todo-images")
    .upload(filePath, image, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    if (import.meta.env.DEV) {
      console.error({
        message: uploadError.message,
      });
    }
    throw { code: "UPLOAD_IMAGE_ERROR" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("todo-images").getPublicUrl(filePath);

  return publicUrl;
}

export async function addTodo(
  todoDetails: TodoInsertWithFile,
  selectedDate: string,
  currentUser: User
) {
  let imageUrl = "";

  // Przygotuj obiekt do insert - pomijamy id, żeby Supabase sam je wygenerował
  const insertData: TodoInsert = {
    user_id: currentUser.accountId,
    todo: todoDetails.todo,
    todo_more_content: todoDetails.todo_more_content ?? null,
    image_url: imageUrl || null,
    todo_date: selectedDate,
    is_completed: false,
  };

  // Jeśli jest obrazek, najpierw wstawiamy todo żeby dostać ID, potem uploadujemy obrazek
  if (todoDetails.imageFile) {
    const { data: todo, error } = await supabase
      .from("todos")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) {
        console.error({
          code: error.code,
          message: error.message,
        });
      }
      throw { code: "CREATE_TODO_ERROR" };
    }

    // Teraz mamy ID, możemy uploadować obrazek
    imageUrl = await uploadImageAndGetUrl(
      currentUser.accountId,
      todo.id,
      todoDetails.imageFile
    );

    // Aktualizujemy todo z URL obrazka
    const { error: updateError } = await supabase
      .from("todos")
      .update({ image_url: imageUrl })
      .eq("id", todo.id);

    if (updateError) {
      if (import.meta.env.DEV) {
        console.error({
          code: updateError.code,
          message: updateError.message,
        });
      }
      throw { code: "UPDATE_TODO_ERROR" };
    }

    const { error: updateOriginalTodoIdError } = await supabase
      .from("todos")
      .update({ original_todo_id: todo.id })
      .eq("id", todo.id);

    if (updateOriginalTodoIdError) {
      if (import.meta.env.DEV) {
        console.error({
          code: updateOriginalTodoIdError.code,
          message: updateOriginalTodoIdError.message,
        });
      }
      throw { code: "UPDATE_TODO_ERROR" };
    }

    return todo;
  } else {
    // Bez obrazka - prosty insert
    const { data: todo, error } = await supabase
      .from("todos")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) {
        console.error({
          code: error.code,
          message: error.message,
        });
      }
      throw { code: "CREATE_TODO_ERROR" };
    }

    if (!error) {
      const { error: updateOriginalTodoIdError } = await supabase
        .from("todos")
        .update({ original_todo_id: todo.id })
        .eq("id", todo.id);

      if (updateOriginalTodoIdError) {
        if (import.meta.env.DEV) {
          console.error({
            code: updateOriginalTodoIdError.code,
            message: updateOriginalTodoIdError.message,
          });
        }
        throw { code: "UPDATE_TODO_ERROR" };
      }
    }

    return todo;
  }
}

export async function updateTodoCompletionStatus(
  todoId: string,
  selectedDate: string,
  currentUser: User,
  isCompleted: boolean
) {
  const { error } = await supabase
    .from("todos")
    .update({ is_completed: isCompleted })
    .eq("id", todoId)
    .eq("user_id", currentUser.accountId)
    .eq("todo_date", selectedDate);

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "UPDATE_TODO_COMPLETION_STATUS_ERROR" };
  }
}

export async function deleteTodo(
  todoId: string,
  selectedDate: string,
  currentUser: User
) {
  const { data: todo, error: getTodoError } = await supabase
    .from("todos")
    .select("*")
    .eq("id", todoId)
    .eq("user_id", currentUser.accountId)
    .eq("todo_date", selectedDate)
    .single();

  if (getTodoError) {
    if (import.meta.env.DEV) {
      console.error({
        code: getTodoError.code,
        message: getTodoError.message,
      });
    }
    throw { code: "GET_TODO_ERROR" };
  }

  if (todo.image_url) {
    await handleImageDeletion(currentUser.accountId, todo.image_url, todoId);
  }

  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", todoId)
    .eq("user_id", currentUser.accountId)
    .eq("todo_date", selectedDate);

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }

    throw { code: "DELETE_TODO_ERROR" };
  }
}

export async function updateRelatedTodos(
  accountId: string,
  originalTodoId: string,
  updates: Partial<{
    todo: string;
    todo_more_content: string | null;
    image_url: string | null;
  }>
) {
  const { data: relatedTodos, error: findError } = await supabase
    .from("todos")
    .select("id, todo_date, image_url")
    .eq("user_id", accountId)
    .eq("original_todo_id", originalTodoId)
    .eq("is_independent_edit", false)
    .neq("id", originalTodoId); // Exclude the original todo itself

  if (findError) {
    if (import.meta.env.DEV) {
      console.error({
        message: findError.message,
      });
    }
    throw { code: "FIND_RELATED_TODOS_ERROR" };
  }

  if (relatedTodos && relatedTodos.length > 0) {
    if (updates.image_url !== undefined) {
      for (const relatedTodo of relatedTodos) {
        if (
          relatedTodo.image_url &&
          relatedTodo.image_url !== updates.image_url
        ) {
          await handleImageDeletion(
            accountId,
            relatedTodo.image_url,
            relatedTodo.id
          );
        }
      }
    }

    const { error: updateError } = await supabase
      .from("todos")
      .update(updates)
      .eq("user_id", accountId)
      .eq("original_todo_id", originalTodoId)
      .eq("is_independent_edit", false)
      .neq("id", originalTodoId);

    if (updateError) {
      if (import.meta.env.DEV) {
        console.error({
          message: updateError.message,
        });
      }
      throw { code: "UPDATE_RELATED_TODOS_ERROR" };
    }

    if (import.meta.env.DEV) {
      console.log("Updated related todos:", {
        originalTodoId,
        updates,
        updatedCount: relatedTodos.length,
        updatedTodos: relatedTodos.map((t) => ({
          id: t.id,
          date: t.todo_date,
        })),
      });
    }
  }
}

export async function editTodo(
  todoId: string,
  newTodoDetails: TodoUpdateDetails,
  currentUser: User
) {
  const { data: currentTodo, error: getTodoError } = await supabase
    .from("todos")
    .select("*")
    .eq("id", todoId)
    .eq("user_id", currentUser.accountId)
    .single();

  if (getTodoError) {
    if (import.meta.env.DEV) {
      console.error({
        message: getTodoError.message,
      });
    }
    throw { code: "GET_TODO_ERROR" };
  }

  let image_url = currentTodo.image_url;

  const isRepeatedTodo = Boolean(
    currentTodo.original_todo_id &&
      currentTodo.original_todo_id !== currentTodo.id
  );

  const isBecomingIndependent =
    isRepeatedTodo && !currentTodo.is_independent_edit;

  if (newTodoDetails.deleteImage) {
    image_url = null;
  } else if (newTodoDetails.imageFile) {
    image_url = await uploadImageAndGetUrl(
      currentUser.accountId,
      todoId,
      newTodoDetails.imageFile
    );
  }

  const updateData: Partial<{
    todo: string;
    todo_more_content: string | null;
    image_url: string | null;
    is_independent_edit: boolean;
    original_todo_id: string;
  }> = { image_url };

  if (newTodoDetails.todo !== undefined) {
    updateData.todo = newTodoDetails.todo;
  }

  if (newTodoDetails.todo_more_content !== undefined) {
    updateData.todo_more_content = newTodoDetails.todo_more_content;
  }

  if (isBecomingIndependent) {
    updateData.is_independent_edit = true;
    updateData.original_todo_id = todoId;

    if (import.meta.env.DEV) {
      console.log("Marking repeated todo as independent:", {
        todoId,
        wasOriginalTodoId: currentTodo.original_todo_id,
        newOriginalTodoId: todoId,
      });
    }
  }

  const isOriginalTodo = currentTodo.original_todo_id === currentTodo.id;
  const oldImageUrl = currentTodo.image_url;

  if (
    isOriginalTodo &&
    (newTodoDetails.todo !== undefined ||
      newTodoDetails.todo_more_content !== undefined ||
      newTodoDetails.imageFile ||
      newTodoDetails.deleteImage)
  ) {
    const relatedUpdates: Partial<{
      todo: string;
      todo_more_content: string | null;
      image_url: string | null;
    }> = {};

    if (newTodoDetails.todo !== undefined) {
      relatedUpdates.todo = newTodoDetails.todo;
    }
    if (newTodoDetails.todo_more_content !== undefined) {
      relatedUpdates.todo_more_content = newTodoDetails.todo_more_content;
    }
    if (newTodoDetails.imageFile || newTodoDetails.deleteImage) {
      relatedUpdates.image_url = image_url;
    }

    await updateRelatedTodos(currentUser.accountId, todoId, relatedUpdates);
  }

  const { error: updateError } = await supabase
    .from("todos")
    .update(updateData)
    .eq("id", todoId)
    .eq("user_id", currentUser.accountId);

  if (updateError) {
    if (import.meta.env.DEV) {
      console.error({
        message: updateError.message,
      });
    }
    throw { code: "UPDATE_TODO_ERROR" };
  }

  if ((newTodoDetails.imageFile || newTodoDetails.deleteImage) && oldImageUrl) {
    if (isOriginalTodo) {
      await handleImageDeletion(currentUser.accountId, oldImageUrl, todoId);
    } else if (isRepeatedTodo) {
      await handleImageDeletion(
        currentUser.accountId,
        currentTodo.image_url!,
        todoId
      );
    }
  }

  const updatedTodo = { ...currentTodo, image_url };

  if (newTodoDetails.todo !== undefined) {
    updatedTodo.todo = newTodoDetails.todo;
  }

  if (newTodoDetails.todo_more_content !== undefined) {
    updatedTodo.todo_more_content = newTodoDetails.todo_more_content;
  }

  return updatedTodo;
}

export async function repeatTodo(
  todoDetails: TodoRow,
  newDate: string,
  currentUser: User
) {
  const sourceOriginalTodoId = todoDetails.original_todo_id || todoDetails.id;

  const insertData: TodoInsert = {
    user_id: currentUser.accountId,
    todo: todoDetails.todo,
    todo_more_content: todoDetails.todo_more_content,
    image_url: todoDetails.image_url,
    todo_date: newDate,
    is_completed: false,
    original_todo_id: sourceOriginalTodoId,
    is_independent_edit: false,
    from_delegated: todoDetails.from_delegated || false,
  };

  const { data: repeatedTodo, error } = await supabase
    .from("todos")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "REPEAT_TODO_ERROR" };
  }

  if (import.meta.env.DEV) {
    console.log("Todo repeated successfully:", {
      originalId: todoDetails.id,
      repeatedId: repeatedTodo.id,
      originalTodoId: sourceOriginalTodoId,
      hasImage: !!todoDetails.image_url,
      newDate,
    });
  }

  return { success: true, todoId: repeatedTodo.id, todo: repeatedTodo };
}

export async function moveTodo(
  todoId: string,
  newDate: string,
  currentUser: User,
  originalDate: string
) {
  const { data: todoToMove, error: getTodoError } = await supabase
    .from("todos")
    .select("*")
    .eq("id", todoId)
    .eq("user_id", currentUser.accountId)
    .eq("todo_date", originalDate)
    .single();

  if (getTodoError) {
    if (import.meta.env.DEV) {
      console.error({
        code: getTodoError.code,
        message: getTodoError.message,
      });
    }
    throw { code: "GET_TODO_ERROR" };
  }

  if (todoToMove.is_completed) {
    throw { code: "CANNOT_MOVE_COMPLETED_TODO" };
  }

  const { error: updateError } = await supabase
    .from("todos")
    .update({
      todo_date: newDate,
    })
    .eq("id", todoId)
    .eq("user_id", currentUser.accountId)
    .eq("todo_date", originalDate);

  if (updateError) {
    if (import.meta.env.DEV) {
      console.error({
        code: updateError.code,
        message: updateError.message,
      });
    }
    throw { code: "MOVE_TODO_ERROR" };
  }

  return { success: true, todoId };
}

export async function countImageReferences(
  accountId: string,
  imageUrl: string,
  excludingTodoId?: string
) {
  if (!imageUrl) return 0;

  const { data: todos, error } = await supabase
    .from("todos")
    .select("id, image_url")
    .eq("user_id", accountId)
    .eq("image_url", imageUrl);

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        message: error.message,
      });
    }
    return 0;
  }

  const filteredTodos = excludingTodoId
    ? todos.filter((todo) => todo.id !== excludingTodoId)
    : todos;

  return filteredTodos.length;
}

export async function isLastImageReference(
  accountId: string,
  imageUrl: string,
  excludingTodoId: string
) {
  const referenceCount = await countImageReferences(
    accountId,
    imageUrl,
    excludingTodoId
  );
  return referenceCount === 0;
}

export function getFilePathFromUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");

    const bucketIndex = pathParts.indexOf("todo-images");
    if (bucketIndex === -1) return null;

    const filePath = pathParts.slice(bucketIndex + 1).join("/");
    return filePath;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Error parsing image URL:", error);
    }
    return null;
  }
}

export async function handleImageDeletion(
  accountId: string,
  imageUrl: string,
  excludingTodoId: string
) {
  if (!imageUrl || typeof imageUrl !== "string") return;

  const isLastReference = await isLastImageReference(
    accountId,
    imageUrl,
    excludingTodoId
  );

  if (isLastReference) {
    const filePath = getFilePathFromUrl(imageUrl);
    if (!filePath) {
      if (import.meta.env.DEV) {
        console.warn("Could not extract file path from URL:", imageUrl);
      }
      return;
    }

    const { error: deleteError } = await supabase.storage
      .from("todo-images")
      .remove([filePath]);

    if (deleteError) {
      if (import.meta.env.DEV) {
        console.error({
          message: deleteError.message,
        });
      }
      throw { code: "DELETE_IMAGE_ERROR" };
    }

    if (import.meta.env.DEV) {
      console.log("Image deleted - was the last reference:", filePath);
    }
  } else {
    if (import.meta.env.DEV) {
      console.log("Image kept - other todos still reference it:", imageUrl);
    }
  }
}
