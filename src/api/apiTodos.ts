import {
  FILES_FOLDER_todoImages,
  TABLE_NAME_taskerUserTodos,
} from '@/lib/constants';
import { storage } from '@/lib/firebase.config';
import { getFirestoreDocRef } from '@/lib/firebaseHelpers';
import { convertTimestampToDate } from '@/lib/helpers';
import {
  TodoItem,
  TodoItemBase,
  TodoItemDetails,
  TodoItemDetailsGlobalSearch,
  User,
} from '@/types/types';
import {
  getDoc,
  updateDoc,
  DocumentSnapshot,
  DocumentReference,
  DocumentData,
  deleteField,
  setDoc
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

export async function getUserTodos(accountId: string, selectedDate: string) {
  const docSnapshot = await getUserTodosDocSnapshot(accountId);
  if (!docSnapshot.exists()) return null;

  const userData = docSnapshot.data();
  if (!userData[selectedDate]?.userTodosOfDay) return null;

  const docRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, accountId);
  return {
    docRef,
    userData,
    todosOfDay: userData[selectedDate].userTodosOfDay,
  };
}

export async function getUserTodosDocSnapshot(accountId: string) {
  const userTodosDocRef = getFirestoreDocRef(
    TABLE_NAME_taskerUserTodos,
    accountId
  );
  return await getDoc(userTodosDocRef);
}

export async function getTodosFromDay(selectedDate: string, currentUser: User) {
  const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
  return getTodosForDate(selectedDate, docSnapshot);
}

export async function getTodosForDate(
  selectedDate: string,
  docSnapshot: DocumentSnapshot
): Promise<TodoItemDetails[]> {
  if (!docSnapshot.exists()) return [];

  const userData = docSnapshot.data();
  const dayData = userData[selectedDate];
  return dayData?.userTodosOfDay ?? [];
}

export async function getTodoById(
  todoId: string,
  selectedDate: string,
  currentUser: User
) {
  const result = await getUserTodos(currentUser.accountId, selectedDate);
  if (!result) return;

  const { todosOfDay } = result;
  const todo = todosOfDay.find((todo: TodoItemBase) => todo.id === todoId);
  return todo;
}

export async function uploadImageAndGetUrl(
  accountId: string,
  selectedDate: string,
  todoId: string,
  image: File
) {
  const imageRef = ref(
    storage,
    `${FILES_FOLDER_todoImages}/${accountId}/${selectedDate}_${todoId}`
  );
  const uploadTask = uploadBytesResumable(imageRef, image);
  await uploadTask;
  return await getDownloadURL(uploadTask.snapshot.ref);
}

export function createTodoItem(
  todoDetails: TodoItem,
  todoId: string,
  imageUrl: string
) {
  return {
    id: todoId,
    todo: todoDetails.todo,
    todoMoreContent: todoDetails.todoMoreContent,
    imageUrl: imageUrl,
    isCompleted: false,
    createdAt: new Date(),
  };
}

export async function updateOrCreateTodos(
  docRef: DocumentReference,
  selectedDate: string,
  todoItem: TodoItemBase,
  userData: DocumentData | undefined,
  currentUser: User
) {
  if (userData && userData[selectedDate]?.userTodosOfDay) {
    await updateDoc(docRef, {
      [selectedDate]: {
        userTodosOfDay: [...userData[selectedDate].userTodosOfDay, todoItem],
      },
    });
  } else {
    await setDoc(docRef, {
      [selectedDate]: {
        userTodosOfDay: [todoItem],
      },
      userInfo: currentUser,
    }, { merge: true });
  }
}

export async function addTodo(
  todoDetails: TodoItem,
  selectedDate: string,
  currentUser: User
) {
  const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
  const docRef = getFirestoreDocRef(
    TABLE_NAME_taskerUserTodos,
    currentUser.accountId
  );

  const todoId = crypto.randomUUID();
  let imageUrl = '';

  if (todoDetails.imageUrl) {
    imageUrl = await uploadImageAndGetUrl(
      currentUser.accountId,
      selectedDate,
      todoId,
      todoDetails.imageUrl as File
    );
  }

  const todoItem = createTodoItem(todoDetails, todoId, imageUrl);

  const userData = docSnapshot.exists() ? docSnapshot.data() : undefined;
  await updateOrCreateTodos(
    docRef,
    selectedDate,
    todoItem,
    userData,
    currentUser
  );
}

export async function editTodo(
  todoId: string,
  newTodoDetails: Partial<TodoItemDetails>,
  selectedDate: string,
  currentUser: User,
  deleteImage: boolean
) {
  const result = await getUserTodos(currentUser.accountId, selectedDate);
  if (!result) return;

  const { docRef, todosOfDay } = result;
  const todoToEdit = findTodoById(todosOfDay, todoId);
  const isRepeatedTodo = Boolean(todoToEdit?.originalTodoId);

  if (newTodoDetails.imageUrl && 
      todoToEdit?.imageUrl && 
      typeof todoToEdit.imageUrl === 'string' &&
      (!isRepeatedTodo || todoToEdit.isIndependentEdit)) {
    await deleteStorageFile(
      currentUser.accountId,
      todoToEdit.originalDate || selectedDate,
      todoId
    );
  }

  if (deleteImage && todoToEdit?.imageUrl && typeof todoToEdit.imageUrl === 'string') {
    await handleTodoImageDelete(
      currentUser.accountId,
      selectedDate,
      todoId,
      todosOfDay,
      todoToEdit.originalTodoId
    );
  } else if (newTodoDetails.imageUrl) {
    await handleTodoImageUploadAndUpdate(
      docRef,
      todoId,
      newTodoDetails.imageUrl as File,
      selectedDate,
      todosOfDay,
      currentUser.accountId
    );
  }

  const currentResult = await getUserTodos(currentUser.accountId, selectedDate);
  if (!currentResult) return;

  const updatedUserTodos = updateTodosList(
    todoId,
    newTodoDetails,
    currentResult.todosOfDay,
    deleteImage,
    isRepeatedTodo
  );

  await updateTodosInDatabase(docRef, selectedDate, updatedUserTodos);

  if (!isRepeatedTodo && (newTodoDetails.todo || newTodoDetails.todoMoreContent)) {
    await updateAllRelatedTodos(
      currentUser.accountId,
      selectedDate,
      todoId,
      (todo) => {
        if (!todo.isIndependentEdit) {
          return {
            ...todo,
            todo: newTodoDetails.todo || todo.todo,
            todoMoreContent: newTodoDetails.todoMoreContent || todo.todoMoreContent,
          };
        }
        return todo;
      }
    );
  }
}

export function updateTodosList(
  todoId: string,
  newTodoDetails: Partial<TodoItemDetails>,
  todosOfDay: TodoItemDetails[],
  deleteImage: boolean,
  isRepeatedTodo?: boolean
) {
  return todosOfDay.map((todo) => {
    if (todo.id === todoId) {
      return {
        ...todo,
        todo: newTodoDetails.todo || todo.todo,
        todoMoreContent: newTodoDetails.todoMoreContent || todo.todoMoreContent,
        imageUrl: deleteImage ? '' : todo.imageUrl,
        updatedAt: new Date(),
        ...(Boolean(isRepeatedTodo) && { isIndependentEdit: true }),
      };
    }
    return todo;
  });
}

export async function updateTodosInDatabase(
  docRef: DocumentReference,
  selectedDate: string,
  updatedUserTodos: TodoItemDetails[]
) {
  await updateDoc(docRef, {
    [selectedDate]: {
      userTodosOfDay: updatedUserTodos,
    },
  });
}

export async function handleTodoImageDelete(
  accountId: string,
  selectedDate: string,
  todoId: string,
  todosOfDay: TodoItemDetails[],
  originalTodoId?: string
) {
  const todoToDelete = todosOfDay.find(
    (todo: TodoItemDetails) => todo.id === todoId
  );
  
  const dateForStorage = todoToDelete?.originalDate || selectedDate;

  if (!todoToDelete?.imageUrl || typeof todoToDelete.imageUrl !== 'string')
    return;

  if (originalTodoId) {
    const docRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, accountId);
    const updatedTodos = todosOfDay.map((todo) =>
      todo.id === todoId
        ? { ...todo, imageUrl: '', isIndependentEdit: true }
        : todo
    );

    await updateDoc(docRef, {
      [selectedDate]: {
        userTodosOfDay: updatedTodos,
      },
    });

    if (todoToDelete.isIndependentEdit && !todoToDelete.imageUrl.includes(originalTodoId)) {
      await deleteStorageFile(accountId, dateForStorage, todoId);
    }
    return;
  }

  const originalImageUrl = todoToDelete.imageUrl;
  await deleteStorageFile(accountId, dateForStorage, todoId);

  await updateAllRelatedTodos(accountId, selectedDate, todoId, (todo) => {
    if (!todo.isIndependentEdit || 
        (todo.isIndependentEdit && todo.imageUrl === originalImageUrl)) {
      return { ...todo, imageUrl: '' };
    }
    return todo;
  });
}

export async function handleTodoImageUploadAndUpdate(
  docRef: DocumentReference,
  todoId: string,
  imageFile: File,
  selectedDate: string,
  updatedUserTodos: TodoItemDetails[],
  accountId: string
) {
  const todoToUpdate = updatedUserTodos.find((todo) => todo.id === todoId);
  const isRepeatedTodo = todoToUpdate?.originalTodoId;

  if (isRepeatedTodo) {
    const newImageUrl = await uploadImageAndGetUrl(
      accountId,
      selectedDate,
      todoId,
      imageFile
    );
    const newUpdatedUserTodos = updatedUserTodos.map((todo) =>
      todo.id === todoId
        ? { 
            ...todo, 
            imageUrl: newImageUrl, 
            isIndependentEdit: true,
            ...(todo.originalDate && { originalDate: selectedDate })
          }
        : todo
    );

    await updateDoc(docRef, {
      [selectedDate]: { userTodosOfDay: newUpdatedUserTodos },
    });
    return;
  }

  const newImageUrl = await uploadImageAndGetUrl(
    accountId,
    selectedDate,
    todoId,
    imageFile
  );

  await updateDoc(docRef, {
    [selectedDate]: {
      userTodosOfDay: updatedUserTodos.map((todo) =>
        todo.id === todoId 
          ? { 
              ...todo, 
              imageUrl: newImageUrl,
              ...(todo.originalDate && { originalDate: selectedDate })
            } 
          : todo
      ),
    },
  });

  await updateAllRelatedTodos(accountId, selectedDate, todoId, (todo) => {
    if (!todo.isIndependentEdit) {
      return { ...todo, imageUrl: newImageUrl };
    }
    if (todo.isIndependentEdit && todo.imageUrl === todoToUpdate?.imageUrl) {
      return { ...todo, imageUrl: newImageUrl };
    }
    return todo;
  });
}

export async function updateTodoCompletionStatus(
  todoId: string,
  selectedDate: string,
  currentUser: User,
  isCompleted: boolean
) {
  const result = await getUserTodos(currentUser.accountId, selectedDate);
  if (!result) return;

  const { docRef, todosOfDay } = result;

  const updatedUserTodos = updateTodoStatusInList(
    todoId,
    todosOfDay,
    isCompleted
  );

  await updateTodosInDatabase(docRef, selectedDate, updatedUserTodos);
}

export function updateTodoStatusInList(
  todoId: string,
  todosOfDay: TodoItemDetails[],
  isCompleted: boolean
) {
  return todosOfDay.map((todo) => {
    if (todo.id === todoId) {
      return { ...todo, isCompleted, updatedAt: new Date() };
    }
    return todo;
  });
}

export async function deleteTodo(
  todoId: string,
  selectedDate: string,
  currentUser: User
) {
  const result = await getUserTodos(currentUser.accountId, selectedDate);
  if (!result) return;

  const { docRef, todosOfDay } = result;
  const todoToDelete = todosOfDay.find(
    (todo: TodoItemDetails) => todo.id === todoId
  );

  if (!todoToDelete?.originalTodoId) {
    const originalImageUrl = todoToDelete?.imageUrl;
    await updateAllRelatedTodos(
      currentUser.accountId,
      selectedDate,
      todoId,
      (todo) => {
        if (!todo.isIndependentEdit || 
            (todo.isIndependentEdit && todo.imageUrl === originalImageUrl)) {
          return { ...todo, imageUrl: '' };
        }
        return todo;
      }
    );
  }

  if (
    (todoToDelete?.originalTodoId && todoToDelete.isIndependentEdit && todoToDelete.imageUrl) ||
    (!todoToDelete?.originalTodoId && todoToDelete?.imageUrl)
  ) {
    await deleteStorageFile(
      currentUser.accountId, 
      todoToDelete.originalDate || selectedDate, 
      todoId
    );
  }

  const updatedUserTodos = filterOutTodoById(todosOfDay, todoId);

  if (updatedUserTodos.length === 0) {
    await removeExistingDateIfNoTodo(docRef, selectedDate);
  } else {
    await updateTodosInDatabase(docRef, selectedDate, updatedUserTodos);
  }
}

export async function removeExistingDateIfNoTodo(
  docRef: DocumentReference,
  selectedDate: string
) {
  await updateDoc(docRef, {
    [selectedDate]: deleteField(),
  });
}
export function filterOutTodoById(
  todosOfDay: TodoItemDetails[],
  todoId: string
) {
  return todosOfDay.filter((todo) => todo.id !== todoId);
}

export function findTodoById(todosOfDay: TodoItemDetails[], todoId: string) {
  return todosOfDay.find((todo) => todo.id === todoId);
}

export async function searchInDatabase(
  searchValue: string,
  currentUser: User
): Promise<TodoItemDetailsGlobalSearch[]> {
  const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
  if (!docSnapshot.exists()) return [];

  const userData = docSnapshot.data();

  const searchResults = getSearchResultsFromUserData(userData, searchValue);

  const sortedResults = sortSearchResultsByDate(searchResults);

  return sortedResults;
}

export function getSearchResultsFromUserData(
  userData: DocumentData,
  searchValue: string
) {
  const searchResults: TodoItemDetailsGlobalSearch[] = [];
  if (!userData) return searchResults;

  for (const dateKey in userData) {
    const todos = userData[dateKey]?.userTodosOfDay;
    if (todos) {
      todos.forEach((todo: TodoItemDetailsGlobalSearch) => {
        if (todo.todo.toLowerCase().includes(searchValue.toLowerCase())) {
          todo.todoDate = dateKey;
          todo.todoSearchValue = searchValue;
          searchResults.push(todo);
        }
      });
    }
  }

  return searchResults;
}

export function sortSearchResultsByDate(
  searchResults: TodoItemDetailsGlobalSearch[]
) {
  return searchResults.sort((a, b) => {
    const dateA =
      a.createdAt instanceof Date
        ? a.createdAt
        : convertTimestampToDate(a.createdAt);
    const dateB =
      b.createdAt instanceof Date
        ? b.createdAt
        : convertTimestampToDate(b.createdAt);

    return dateB.getTime() - dateA.getTime();
  });
}

export async function repeatTodo(
  todoDetails: TodoItemDetails & { todoDate?: string },
  newDate: string,
  currentUser: User
) {
  const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
  if (!docSnapshot.exists()) {
    throw new Error('User document does not exist');
  }

  const docRef = getFirestoreDocRef(
    TABLE_NAME_taskerUserTodos,
    currentUser.accountId
  );

  const todoId = crypto.randomUUID();
  const imageUrl = todoDetails.imageUrl || '';
  //TODO:no needed updatedAt so use eslint comment line
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updatedAt, ...rest } = todoDetails;

  const repeatedTodoItem = {
    ...rest,
    id: todoId,
    imageUrl,
    isCompleted: false,
    isIndependentEdit: false,
    createdAt: new Date(),
    originalTodoId: todoDetails.id,
    originalDate: '',
  };

  const userData = docSnapshot.data();
  await updateOrCreateTodos(
    docRef,
    newDate,
    repeatedTodoItem,
    userData!,
    currentUser
  );

  return { success: true, todoId };
}

export async function moveTodo(
  todoDetails: TodoItemDetails & { todoDate?: string },
  newDate: string,
  currentUser: User,
  originalDate: string
) {
  const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
  if (!docSnapshot.exists()) {
    throw new Error('User document does not exist');
  }

  if (todoDetails.isCompleted) {
    throw new Error('Cannot move completed todo');
  }

  const docRef = getFirestoreDocRef(
    TABLE_NAME_taskerUserTodos,
    currentUser.accountId
  );

  const todoId = todoDetails.id;
  const imageUrl = todoDetails.imageUrl || '';

  const movedTodoItem = {
    ...todoDetails,
    imageUrl,
    updatedAt: new Date(),
    originalDate,
  };

  const userData = docSnapshot.data();

  const originalTodos = userData[originalDate]?.userTodosOfDay || [];
  const updatedOriginalTodos = originalTodos.filter(
    (todo: TodoItemDetails) => todo.id !== todoId
  );

  if (updatedOriginalTodos.length === 0) {
    await updateDoc(docRef, {
      [originalDate]: deleteField(),
    });
  } else {
    await updateDoc(docRef, {
      [originalDate]: {
        userTodosOfDay: updatedOriginalTodos,
      },
    });
  }

  await updateOrCreateTodos(
    docRef,
    newDate,
    movedTodoItem,
    userData!,
    currentUser
  );

  return { success: true, todoId };
}

export async function updateAllRelatedTodos(
  accountId: string,
  excludeDate: string,
  originalTodoId: string,
  updateFn: (todo: TodoItemDetails) => TodoItemDetails
) {
  const docSnapshot = await getUserTodosDocSnapshot(accountId);
  if (!docSnapshot.exists()) return;

  const userData = docSnapshot.data();
  let hasUpdates = false;

  const originalTodo = await findOriginalTodo(userData, originalTodoId);
  const originalImageUrl = originalTodo?.imageUrl;

  for (const date in userData) {
    if (date === 'userInfo' || date === excludeDate) continue;

    const dayTodos = userData[date].userTodosOfDay;
    if (!Array.isArray(dayTodos)) continue;

    const updatedTodos = dayTodos.map((todo) => {
      if (todo.originalTodoId === originalTodoId && 
          (!todo.isIndependentEdit || 
           (todo.isIndependentEdit && todo.imageUrl === originalImageUrl))) {
        return updateFn(todo);
      }
      return todo;
    });

    if (JSON.stringify(dayTodos) !== JSON.stringify(updatedTodos)) {
      const docRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, accountId);
      await updateDoc(docRef, {
        [date]: {
          userTodosOfDay: updatedTodos,
        },
      });
      hasUpdates = true;
    }
  }

  return hasUpdates;
}

export async function findOriginalTodo(userData: DocumentData, todoId: string): Promise<TodoItemDetails | undefined> {
  for (const date in userData) {
    if (date === 'userInfo') continue;
    
    const dayTodos = userData[date].userTodosOfDay;
    if (!Array.isArray(dayTodos)) continue;

    const todo = dayTodos.find((t: TodoItemDetails) => t.id === todoId);
    if (todo) return todo;
  }
  return undefined;
}

export async function deleteStorageFile(
  accountId: string,
  selectedDate: string,
  todoId: string
) {
  const imageRef = ref(
    storage,
    `${FILES_FOLDER_todoImages}/${accountId}/${selectedDate}_${todoId}`
  );
  await deleteObject(imageRef);
  return true;
}
