import { FILES_FOLDER_todoImages, TABLE_NAME_taskerUserTodos } from '@/lib/constants';
import { storage } from '@/lib/firebase.config';
import { getFirestoreDocRef } from '@/lib/firebaseHelpers';
import { convertTimestampToDate } from '@/lib/helpers';
import { TodoItem, TodoItemBase, TodoItemDetails, TodoItemDetailsGlobalSearch, User } from '@/types/types';
import { getDoc, updateDoc, DocumentSnapshot, DocumentReference, DocumentData, deleteField } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

export async function getUserTodos(accountId: string, selectedDate: string) {
  const docSnapshot = await getUserTodosDocSnapshot(accountId);
  if (!docSnapshot.exists()) return null;

  const userData = docSnapshot.data();
  if (!userData[selectedDate]?.userTodosOfDay) return null;

  const docRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, accountId);
  return { docRef, userData, todosOfDay: userData[selectedDate].userTodosOfDay };
}

export async function getUserTodosDocSnapshot(accountId: string) {
  const userTodosDocRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, accountId);
  return await getDoc(userTodosDocRef);
}

export async function getTodosFromDay(selectedDate: string, currentUser: User) {
  const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
  return getTodosForDate(selectedDate, docSnapshot);
}

export function getTodosForDate(selectedDate: string, docSnapshot: DocumentSnapshot) {
  if (!docSnapshot.exists()) return [];

  const userData = docSnapshot.data();
  const dayData = userData[selectedDate];
  return dayData?.userTodosOfDay ?? [];
}

export async function getTodoById(todoId: string, selectedDate: string, currentUser: User) {
  const result = await getUserTodos(currentUser.accountId, selectedDate);
  if (!result) return;

  const { todosOfDay } = result;
  const todo = todosOfDay.find((todo: TodoItemBase) => todo.id === todoId);
  return todo;
}

export async function uploadImageAndGetUrl(accountId: string, selectedDate: string, todoId: string, image: File) {
  const imageRef = ref(storage, `${FILES_FOLDER_todoImages}/${accountId}/${selectedDate}_${todoId}`);
  const uploadTask = uploadBytesResumable(imageRef, image);
  await uploadTask;
  return await getDownloadURL(uploadTask.snapshot.ref);
}

export function createTodoItem(todoDetails: TodoItem, todoId: string, imageUrl: string) {
  return {
    id: todoId,
    todo: todoDetails.todo,
    todoMoreContent: todoDetails.todoMoreContent,
    imageUrl: imageUrl,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateOrCreateTodos(docRef: DocumentReference, selectedDate: string, todoItem: TodoItemBase, userData: DocumentData, currentUser: User) {
  if (userData[selectedDate]?.userTodosOfDay) {
    await updateDoc(docRef, {
      [selectedDate]: {
        userTodosOfDay: [...userData[selectedDate].userTodosOfDay, todoItem],
      },
    });
  } else {
    await updateDoc(docRef, {
      [selectedDate]: {
        userTodosOfDay: [todoItem],
      },
      userInfo: currentUser,
    });
  }
}

export async function addTodo(todoDetails: TodoItem, selectedDate: string, currentUser: User) {
  const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
  const docRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, currentUser.accountId);

  const todoId = crypto.randomUUID();
  let imageUrl = '';

  if (todoDetails.imageUrl) {
    imageUrl = await uploadImageAndGetUrl(currentUser.accountId, selectedDate, todoId, todoDetails.imageUrl as File);
  }

  const todoItem = createTodoItem(todoDetails, todoId, imageUrl);

  const userData = docSnapshot.data();
  await updateOrCreateTodos(docRef, selectedDate, todoItem, userData!, currentUser);
}

export async function editTodo(todoId: string, newTodoDetails: Partial<TodoItemDetails>, selectedDate: string, currentUser: User, deleteImage: boolean) {
  const result = await getUserTodos(currentUser.accountId, selectedDate);
  if (!result) return;

  const { docRef, todosOfDay } = result;

  const updatedUserTodos = updateTodosList(todoId, newTodoDetails, todosOfDay, deleteImage);

  await updateTodosInDatabase(docRef, selectedDate, updatedUserTodos);

  if (deleteImage) {
    await handleTodoImageDelete(currentUser.accountId, selectedDate, todoId, todosOfDay);
  } else if (newTodoDetails.imageUrl) {
    await handleTodoImageUploadAndUpdate(docRef, todoId, newTodoDetails.imageUrl as File, selectedDate, updatedUserTodos, currentUser.accountId);
  }
}

export function updateTodosList(todoId: string, newTodoDetails: Partial<TodoItemDetails>, todosOfDay: TodoItemDetails[], deleteImage: boolean) {
  return todosOfDay.map((todo) => {
    if (todo.id === todoId) {
      return {
        ...todo,
        todo: newTodoDetails.todo || todo.todo,
        todoMoreContent: newTodoDetails.todoMoreContent || todo.todoMoreContent,
        imageUrl: deleteImage ? '' : todo.imageUrl,
        updatedAt: new Date(),
      };
    }
    return todo;
  });
}

export async function updateTodosInDatabase(docRef: DocumentReference, selectedDate: string, updatedUserTodos: TodoItemDetails[]) {
  await updateDoc(docRef, {
    [selectedDate]: {
      userTodosOfDay: updatedUserTodos,
    },
  });
}

export async function handleTodoImageDelete(accountId: string, selectedDate: string, todoId: string, todosOfDay: TodoItemDetails[]) {
  const todoToDelete = todosOfDay.find((todo) => todo.id === todoId);
  if (todoToDelete?.imageUrl) {
    const imageRef = ref(storage, `${FILES_FOLDER_todoImages}/${accountId}/${selectedDate}_${todoId}`);
    await deleteObject(imageRef);
  }
}

export async function handleTodoImageUploadAndUpdate(
  docRef: DocumentReference,
  todoId: string,
  imageFile: File,
  selectedDate: string,
  updatedUserTodos: TodoItemDetails[],
  accountId: string
) {
  const newImageUrl = await uploadImageAndGetUrl(accountId, selectedDate, todoId, imageFile);
  const newUpdatedUserTodos = updatedUserTodos.map((todo) => (todo.id === todoId ? { ...todo, imageUrl: newImageUrl } : todo));
  await updateDoc(docRef, { [selectedDate]: { userTodosOfDay: newUpdatedUserTodos } });
}

export async function updateTodoCompletionStatus(todoId: string, selectedDate: string, currentUser: User, isCompleted: boolean) {
  const result = await getUserTodos(currentUser.accountId, selectedDate);
  if (!result) return;

  const { docRef, todosOfDay } = result;

  const updatedUserTodos = updateTodoStatusInList(todoId, todosOfDay, isCompleted);

  await updateTodosInDatabase(docRef, selectedDate, updatedUserTodos);
}

export function updateTodoStatusInList(todoId: string, todosOfDay: TodoItemDetails[], isCompleted: boolean) {
  return todosOfDay.map((todo) => {
    if (todo.id === todoId) {
      return { ...todo, isCompleted, updatedAt: new Date() };
    }
    return todo;
  });
}

export async function deleteTodo(todoId: string, selectedDate: string, currentUser: User) {
  const result = await getUserTodos(currentUser.accountId, selectedDate);
  if (!result) return;

  const { docRef, todosOfDay } = result;

  const updatedUserTodos = filterOutTodoById(todosOfDay, todoId);

  if (updatedUserTodos.length === 0) {
    await removeExistingDateIfNoTodo(docRef, selectedDate);
  } else {
    await updateTodosInDatabase(docRef, selectedDate, updatedUserTodos);
  }

  const todoToDelete = findTodoById(todosOfDay, todoId);
  if (todoToDelete?.imageUrl) {
    await deleteTodoImage(currentUser.accountId, selectedDate, todoId);
  }
}

export async function removeExistingDateIfNoTodo(docRef: DocumentReference, selectedDate: string) {
  await updateDoc(docRef, {
    [selectedDate]: deleteField(),
  });
}
export function filterOutTodoById(todosOfDay: TodoItemDetails[], todoId: string) {
  return todosOfDay.filter((todo) => todo.id !== todoId);
}

export function findTodoById(todosOfDay: TodoItemDetails[], todoId: string) {
  return todosOfDay.find((todo) => todo.id === todoId);
}

export async function deleteTodoImage(accountId: string, selectedDate: string, todoId: string) {
  const imageRef = ref(storage, `${FILES_FOLDER_todoImages}/${accountId}/${selectedDate}_${todoId}`);
  await deleteObject(imageRef);
}

export async function searchInDatabase(searchValue: string, currentUser: User) {
  const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
  if (!docSnapshot.exists()) return;

  const userData = docSnapshot.data();

  const searchResults = getSearchResultsFromUserData(userData, searchValue);

  const sortedResults = sortSearchResultsByDate(searchResults);

  return sortedResults;
}

function getSearchResultsFromUserData(userData: DocumentData, searchValue: string): TodoItemDetailsGlobalSearch[] {
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

export function sortSearchResultsByDate(searchResults: TodoItemDetailsGlobalSearch[]): TodoItemDetailsGlobalSearch[] {
  return searchResults.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : convertTimestampToDate(a.createdAt);
    const dateB = b.createdAt instanceof Date ? b.createdAt : convertTimestampToDate(b.createdAt);

    return dateB.getTime() - dateA.getTime();
  });
}
