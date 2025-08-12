import { supabase } from "@/lib/supabaseClient";
import { TodoInsertWithFile, TodoInsert, User } from "@/types/types";

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

// Helper function do tworzenia obiektu todo (może być przydatne do mapowania danych)
// export function createTodoItem(
//   todoDetails: TodoInsert,
//   todoId: string,
//   imageUrl?: string
// ) {
//   return {
//     id: todoId,
//     todo: todoDetails.todo,
//     todo_more_content: todoDetails.todo_more_content,
//     image_url: imageUrl || null,
//     user_id: todoDetails.user_id,
//     todo_date: todoDetails.todo_date,
//     is_completed: todoDetails.is_completed || false,
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//   };
// }

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

async function uploadImageAndGetUrl(
  accountId: string,
  todoId: string,
  image: File
) {
  const fileExt = image.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${accountId}/${todoId}/${fileName}`;

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

// export async function editTodo(
//   todoId: string,
//   newTodoDetails: Partial<TodoItemDetails>,
//   selectedDate: string,
//   currentUser: User,
//   deleteImage: boolean
// ) {
//   const result = await getUserTodos(currentUser.accountId, selectedDate);
//   if (!result) return;

//   const { docRef, todosOfDay } = result;
//   const todoToEdit = findTodoById(todosOfDay, todoId);
//   const isRepeatedTodo = Boolean(todoToEdit?.originalTodoId);

//   if (newTodoDetails.imageUrl &&
//       todoToEdit?.imageUrl &&
//       typeof todoToEdit.imageUrl === 'string' &&
//       (!isRepeatedTodo || todoToEdit.isIndependentEdit)) {
//     await handleImageDeletion(currentUser.accountId, todoToEdit.imageUrl, todoId);
//   }

//   if (deleteImage && todoToEdit?.imageUrl && typeof todoToEdit.imageUrl === 'string') {
//     await handleTodoImageDelete(
//       currentUser.accountId,
//       todoId,
//       todosOfDay
//     );
//   } else if (newTodoDetails.imageUrl) {
//     await handleTodoImageUploadAndUpdate(
//       docRef,
//       todoId,
//       newTodoDetails.imageUrl as File,
//       selectedDate,
//       todosOfDay,
//       currentUser.accountId
//     );
//   }

//   const currentResult = await getUserTodos(currentUser.accountId, selectedDate);
//   if (!currentResult) return;

//   const updatedUserTodos = updateTodosList(
//     todoId,
//     newTodoDetails,
//     currentResult.todosOfDay,
//     deleteImage,
//     isRepeatedTodo
//   );

//   await updateTodosInDatabase(docRef, selectedDate, updatedUserTodos);

//   if (!isRepeatedTodo && (newTodoDetails.todo || newTodoDetails.todoMoreContent)) {
//     await updateAllRelatedTodos(
//       currentUser.accountId,
//       selectedDate,
//       todoId,
//       (todo) => {
//         if (!todo.isIndependentEdit) {
//           return {
//             ...todo,
//             todo: newTodoDetails.todo || todo.todo,
//             todoMoreContent: newTodoDetails.todoMoreContent || todo.todoMoreContent,
//           };
//         }
//         return todo;
//       }
//     );
//   }
// }

// export function updateTodosList(
//   todoId: string,
//   newTodoDetails: Partial<TodoItemDetails>,
//   todosOfDay: TodoItemDetails[],
//   deleteImage: boolean,
//   isRepeatedTodo?: boolean
// ) {
//   return todosOfDay.map((todo) => {
//     if (todo.id === todoId) {
//       return {
//         ...todo,
//         todo: newTodoDetails.todo || todo.todo,
//         todoMoreContent: newTodoDetails.todoMoreContent || todo.todoMoreContent,
//         imageUrl: deleteImage ? '' : todo.imageUrl,
//         updatedAt: new Date(),
//         ...(Boolean(isRepeatedTodo) && { isIndependentEdit: true }),
//       };
//     }
//     return todo;
//   });
// }

// export async function updateTodosInDatabase(
//   docRef: DocumentReference,
//   selectedDate: string,
//   updatedUserTodos: TodoItemDetails[]
// ) {
//   await updateDoc(docRef, {
//     [selectedDate]: {
//       userTodosOfDay: updatedUserTodos,
//     },
//   });
// }

// export async function handleTodoImageDelete(
//   accountId: string,
//   todoId: string,
//   todosOfDay: TodoItemDetails[]
// ) {
//   const todoToDelete = todosOfDay.find(
//     (todo: TodoItemDetails) => todo.id === todoId
//   );

//   if (!todoToDelete?.imageUrl || typeof todoToDelete.imageUrl !== 'string') return;

//   await handleImageDeletion(accountId, todoToDelete.imageUrl, todoId);
// }

// export async function handleTodoImageUploadAndUpdate(
//   docRef: DocumentReference,
//   todoId: string,
//   imageFile: File,
//   selectedDate: string,
//   updatedUserTodos: TodoItemDetails[],
//   accountId: string
// ) {
//   const todoToUpdate = updatedUserTodos.find((todo) => todo.id === todoId);
//   const isRepeatedTodo = todoToUpdate?.originalTodoId;
//   const originalImageUrl = todoToUpdate?.imageUrl;
//   const newImageUrl = await uploadImageAndGetUrl(accountId, todoId, imageFile);

//   if (originalImageUrl && originalImageUrl !== newImageUrl) {
//     await handleImageDeletion(accountId, originalImageUrl, todoId);
//   }

//   if (!isRepeatedTodo) {
//     await updateAllRelatedTodos(accountId, selectedDate, todoId, (todo) => {
//       if (!todo.isIndependentEdit ||
//           (todo.isIndependentEdit && todo.imageUrl === originalImageUrl)) {
//         return { ...todo, imageUrl: newImageUrl };
//       }
//       return todo;
//     });
//   }

//   const updatedTodos = updatedUserTodos.map((todo) =>
//     todo.id === todoId
//       ? {
//           ...todo,
//           imageUrl: newImageUrl,
//           ...(isRepeatedTodo && { isIndependentEdit: true })
//         }
//       : todo
//   );

//   await updateDoc(docRef, {
//     [selectedDate]: { userTodosOfDay: updatedTodos },
//   });
// }

// export async function updateTodoCompletionStatus(
//   todoId: string,
//   selectedDate: string,
//   currentUser: User,
//   isCompleted: boolean
// ) {
//   const result = await getUserTodos(currentUser.accountId, selectedDate);
//   if (!result) return;

//   const { docRef, todosOfDay } = result;

//   const updatedUserTodos = updateTodoStatusInList(
//     todoId,
//     todosOfDay,
//     isCompleted
//   );

//   await updateTodosInDatabase(docRef, selectedDate, updatedUserTodos);
// }

// export function updateTodoStatusInList(
//   todoId: string,
//   todosOfDay: TodoItemDetails[],
//   isCompleted: boolean
// ) {
//   return todosOfDay.map((todo) => {
//     if (todo.id === todoId) {
//       return { ...todo, isCompleted, updatedAt: new Date() };
//     }
//     return todo;
//   });
// }

// export async function deleteTodo(
//   todoId: string,
//   selectedDate: string,
//   currentUser: User
// ) {
//   const result = await getUserTodos(currentUser.accountId, selectedDate);
//   if (!result) return;

//   const { docRef, todosOfDay } = result;
//   const todoToDelete = todosOfDay.find(
//     (todo: TodoItemDetails) => todo.id === todoId
//   );

//   if (!todoToDelete) {
//     return;
//   }

//   if (todoToDelete.imageUrl) {
//     await handleImageDeletion(currentUser.accountId, todoToDelete.imageUrl, todoId);
//   }

//   const updatedUserTodos = filterOutTodoById(todosOfDay, todoId);

//   if (updatedUserTodos.length === 0) {
//     await removeExistingDateIfNoTodo(docRef, selectedDate);
//   } else {
//     await updateTodosInDatabase(docRef, selectedDate, updatedUserTodos);
//   }
// }

// export async function removeExistingDateIfNoTodo(
//   docRef: DocumentReference,
//   selectedDate: string
// ) {
//   await updateDoc(docRef, {
//     [selectedDate]: deleteField(),
//   });
// }

// export function filterOutTodoById(
//   todosOfDay: TodoItemDetails[],
//   todoId: string
// ) {
//   return todosOfDay.filter((todo) => todo.id !== todoId);
// }

// export function findTodoById(todosOfDay: TodoItemDetails[], todoId: string) {
//   return todosOfDay.find((todo) => todo.id === todoId);
// }

// export async function searchInDatabase(
//   searchValue: string,
//   currentUser: User
// ) {
//   const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
//   if (!docSnapshot.exists()) return [];

//   const userData = docSnapshot.data();

//   const searchResults = getSearchResultsFromUserData(userData, searchValue);

//   const sortedResults = sortSearchResultsByDate(searchResults);

//   return sortedResults;
// }

// export function getSearchResultsFromUserData(
//   userData: DocumentData,
//   searchValue: string
// ) {
//   const searchResults: TodoItemDetailsGlobalSearch[] = [];
//   if (!userData) return searchResults;

//   for (const dateKey in userData) {
//     const todos = userData[dateKey]?.userTodosOfDay;
//     if (todos) {
//       todos.forEach((todo: TodoItemDetailsGlobalSearch) => {
//         if (todo.todo.toLowerCase().includes(searchValue.toLowerCase())) {
//           todo.todoDate = dateKey;
//           todo.todoSearchValue = searchValue;
//           searchResults.push(todo);
//         }
//       });
//     }
//   }

//   return searchResults;
// }

// export function sortSearchResultsByDate(
//   searchResults: TodoItemDetailsGlobalSearch[]
// ) {
//   return searchResults.sort((a, b) => {
//     const dateA =
//       a.createdAt instanceof Date
//         ? a.createdAt
//         : convertTimestampToDate(a.createdAt);
//     const dateB =
//       b.createdAt instanceof Date
//         ? b.createdAt
//         : convertTimestampToDate(b.createdAt);

//     return dateB.getTime() - dateA.getTime();
//   });
// }

// export async function repeatTodo(
//   todoDetails: TodoItemDetails & { todoDate?: string },
//   newDate: string,
//   currentUser: User
// ) {
//   const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
//   if (!docSnapshot.exists()) {
//     throw new Error("User doc doesn't exists");
//   }

//   const docRef = getFirestoreDocRef(
//     TABLE_NAME_taskerUserTodos,
//     currentUser.accountId
//   );

//   const todoId = crypto.randomUUID();

//   const sourceOriginalTodoId = todoDetails.originalTodoId || todoDetails.id;
//   const imageUrl = todoDetails.imageUrl;

//   const repeatedTodoItem = {
//     ...todoDetails,
//     id: todoId,
//     imageUrl,
//     isCompleted: false,
//     isIndependentEdit: false,
//     createdAt: new Date(),
//     originalTodoId: sourceOriginalTodoId,
//     fromDelegated: false,
//   };

//   const userData = docSnapshot.data();
//   await updateOrCreateTodos(
//     docRef,
//     newDate,
//     repeatedTodoItem,
//     userData!,
//     currentUser
//   );

//   return { success: true, todoId };
// }

// export async function moveTodo(
//   todoDetails: TodoItemDetails & { todoDate?: string },
//   newDate: string,
//   currentUser: User,
//   originalDate: string
// ) {
//   const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
//   if (!docSnapshot.exists()) {
//     throw new Error('User document does not exist');
//   }

//   if (todoDetails.isCompleted) {
//     throw new Error('Cannot move completed todo');
//   }

//   const docRef = getFirestoreDocRef(
//     TABLE_NAME_taskerUserTodos,
//     currentUser.accountId
//   );

//   const todoId = todoDetails.id;
//   const imageUrl = todoDetails.imageUrl || '';

//   const movedTodoItem = {
//     ...todoDetails,
//     imageUrl,
//     updatedAt: new Date(),
//   };

//   const userData = docSnapshot.data();

//   const originalTodos = userData[originalDate]?.userTodosOfDay || [];
//   const updatedOriginalTodos = originalTodos.filter(
//     (todo: TodoItemDetails) => todo.id !== todoId
//   );

//   if (updatedOriginalTodos.length === 0) {
//     await updateDoc(docRef, {
//       [originalDate]: deleteField(),
//     });
//   } else {
//     await updateDoc(docRef, {
//       [originalDate]: {
//         userTodosOfDay: updatedOriginalTodos,
//       },
//     });
//   }

//   await updateOrCreateTodos(
//     docRef,
//     newDate,
//     movedTodoItem,
//     userData!,
//     currentUser
//   );

//   return { success: true, todoId };
// }

// export async function updateAllRelatedTodos(
//   accountId: string,
//   excludeDate: string,
//   originalTodoId: string,
//   updateFn: (todo: TodoItemDetails) => TodoItemDetails
// ) {
//   const docSnapshot = await getUserTodosDocSnapshot(accountId);
//   if (!docSnapshot.exists()) return;

//   const userData = docSnapshot.data();
//   let hasUpdates = false;

//   for (const date in userData) {
//     if (date === 'userInfo' || date === excludeDate) continue;

//     const dayTodos = userData[date].userTodosOfDay;
//     if (!Array.isArray(dayTodos)) continue;

//     const updatedTodos = dayTodos.map((todo) => {
//       if (todo.originalTodoId === originalTodoId) {
//         return updateFn(todo);
//       }
//       return todo;
//     });

//     if (JSON.stringify(dayTodos) !== JSON.stringify(updatedTodos)) {
//       const docRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, accountId);
//       await updateDoc(docRef, {
//         [date]: {
//           userTodosOfDay: updatedTodos,
//         },
//       });
//       hasUpdates = true;
//     }
//   }

//   return hasUpdates;
// }

// export async function findOriginalTodo(userData: DocumentData, todoId: string) {
//   for (const date in userData) {
//     if (date === 'userInfo') continue;

//     const dayTodos = userData[date].userTodosOfDay;
//     if (!Array.isArray(dayTodos)) continue;

//     const todo = dayTodos.find((t: TodoItemDetails) => t.id === todoId);
//     if (todo) return todo;
//   }
//   return undefined;
// }

// function getFileIdFromUrl(url: string): string {
//   // Usuń parametry URL (wszystko po ?)
//   const urlWithoutParams = url.split('?')[0];

//   // Zdekoduj URL (zamień %2F na /)
//   const decodedUrl = decodeURIComponent(urlWithoutParams);

//   // Podziel na segmenty
//   const urlParts = decodedUrl.split('/');

//   // Weź ostatni segment
//   const fileId = urlParts[urlParts.length - 1];

//   console.log('Pobrane ID pliku:', fileId);
//   return fileId;
// }

// export async function deleteStorageFile(
//   accountId: string,
//   fileId: string
// ) {
//   try {
//     if (!fileId) {
//       console.warn('Brak prawidłowego ID pliku');
//       return false;
//     }

//     const path = `${FILES_FOLDER_todoImages}/${accountId}/${fileId}`;
//     console.log('Próba usunięcia pliku:', { path });

//     const imageRef = ref(storage, path);
//     await deleteObject(imageRef);
//     console.log(`Pomyślnie usunięto plik: ${path}`);
//     return true;
//   } catch (error) {
//     console.error(`Błąd podczas usuwania pliku: ${fileId}`, error);
//     throw error;
//   }
// }

// export async function delegateTodo(
//   todoId: string,
//   selectedDate: string,
//   currentUser: User
// ) {
//   const result = await getUserTodos(currentUser.accountId, selectedDate);
//   if (!result) return;

//   const { docRef, todosOfDay } = result;
//   const todoToDelegate = todosOfDay.find((todo: TodoItemDetails) => todo.id === todoId);

//   if (!todoToDelegate) return;

//   const userDelegatedTodosRef = getFirestoreDocRef(
//     TABLE_NAME_taskerDelegatedTodos,
//     currentUser.accountId
//   );
//   const delegatedDocSnapshot = await getDoc(userDelegatedTodosRef);

//   const delegatedTodo: Omit<TodoItemDetails, 'imageUrl'> & { imageUrl: string } = {
//     id: todoId,
//     todo: todoToDelegate.todo,
//     todoMoreContent: todoToDelegate.todoMoreContent || '',
//     imageUrl: todoToDelegate.imageUrl as string,
//     isCompleted: false,
//     createdAt: new Date(),
//     originalTodoId: todoToDelegate.originalTodoId || todoId,
//     fromDelegated: false
//   };

//   if (delegatedDocSnapshot.exists()) {
//     await setDoc(
//       userDelegatedTodosRef,
//       {
//         userDelegatedTodos: [...delegatedDocSnapshot.data().userDelegatedTodos, delegatedTodo],
//       },
//       { merge: true }
//     );
//   } else {
//     await setDoc(userDelegatedTodosRef, {
//       userDelegatedTodos: [delegatedTodo],
//     });
//   }

//   const updatedTodos = todosOfDay.filter((todo: TodoItemDetails) => todo.id !== todoId);

//   if (updatedTodos.length === 0) {
//     await removeExistingDateIfNoTodo(docRef, selectedDate);
//   } else {
//     await updateTodosInDatabase(docRef, selectedDate, updatedTodos);
//   }

//   return delegatedTodo;
// }

// export async function isImageUsedElsewhere(accountId: string, imageUrl: string, excludingTodoId: string) {
//   const docSnapshot = await getUserTodosDocSnapshot(accountId);
//   if (!docSnapshot.exists()) return false;

//   const userData = docSnapshot.data();

//   for (const date in userData) {
//     if (date === 'userInfo') continue;

//     const todos = userData[date]?.userTodosOfDay;
//     if (todos) {
//       for (const todo of todos) {
//         if (todo.id !== excludingTodoId && todo.imageUrl === imageUrl) {
//           return true;
//         }
//       }
//     }
//   }

//   return false;
// }

// export async function isLastImageReference(
//   accountId: string,
//   imageUrl: string,
//   excludingTodoId: string
// ) {
//   // Sprawdź referencje w taskerUserTodos
//   const userTodosSnapshot = await getUserTodosDocSnapshot(accountId);
//   const userDelegatedTodosRef = getFirestoreDocRef(
//     TABLE_NAME_taskerDelegatedTodos,
//     accountId
//   );
//   const delegatedTodosSnapshot = await getDoc(userDelegatedTodosRef);

//   let referenceCount = 0;

//   // Sprawdź w taskerUserTodos
//   if (userTodosSnapshot.exists()) {
//     const userData = userTodosSnapshot.data();
//     for (const date in userData) {
//       if (date === 'userInfo') continue;

//       const todos = userData[date]?.userTodosOfDay;
//       if (todos) {
//         for (const todo of todos) {
//           if (todo.id !== excludingTodoId && todo.imageUrl === imageUrl) {
//             referenceCount++;
//             if (referenceCount > 0) return false;
//           }
//         }
//       }
//     }
//   }

//   // Sprawdź w taskerDelegatedTodos
//   if (delegatedTodosSnapshot.exists()) {
//     const delegatedTodos = delegatedTodosSnapshot.data().userDelegatedTodos;
//     if (delegatedTodos) {
//       for (const todo of delegatedTodos) {
//         if (todo.id !== excludingTodoId && todo.imageUrl === imageUrl) {
//           referenceCount++;
//           if (referenceCount > 0) return false;
//         }
//       }
//     }
//   }

//   return true;
// }

// // export async function getImageReferences(
// //   accountId: string,
// //   imageUrl: string
// // ) {
// //   const docSnapshot = await getUserTodosDocSnapshot(accountId);
// //   if (!docSnapshot.exists()) return;

// //   const userData = docSnapshot.data();
// //   const references: { todoId: string; date: string }[] = [];

// //   for (const date in userData) {
// //     if (date === 'userInfo') continue;

// //     const todos = userData[date]?.userTodosOfDay;
// //     if (todos) {
// //       todos.forEach((todo: TodoItemDetails) => {
// //         if (todo.imageUrl === imageUrl) {
// //           references.push({ todoId: todo.id, date });
// //         }
// //       });
// //     }
// //   }

// //   return references;
// // }

// export async function handleImageDeletion(
//   accountId: string,
//   imageUrl: string | File,
//   excludingTodoId: string
// ) {
//   if (!imageUrl || typeof imageUrl !== 'string') return;

//   const fileId = getFileIdFromUrl(imageUrl);
//   const isLastReference = await isLastImageReference(accountId, imageUrl, excludingTodoId);

//   if (isLastReference) {
//     try {
//       await deleteStorageFile(accountId, fileId);
//       console.log('Usunięto obraz - to była ostatnia referencja');
//     } catch (error) {
//       console.warn('Błąd podczas usuwania pliku:', error);
//     }
//   }
// }
