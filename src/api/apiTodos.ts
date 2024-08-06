import { FILES_FOLDER_todoImages, TABLE_NAME_taskerUserTodos } from '@/lib/constants';
import { db, storage } from '@/lib/firebase.config';
import { getFirestoreDocRef } from '@/lib/firebaseHelpers';
import { convertTimestampToDate } from '@/lib/helpers';
import { TodoItem, TodoItemBase, TodoItemDetails, TodoItemDetailsGlobalSearch, User } from '@/types/types';
import { doc, getDoc, updateDoc, setDoc, DocumentSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

export async function getTodosFromDay(selectedDate: string, currentUser: User) {
  const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
  return getTodosForDate(selectedDate, docSnapshot);
}

export async function getUserTodosDocSnapshot(accountId: string) {
  const userTodosDocRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, accountId);
  return await getDoc(userTodosDocRef);
}

export function getTodosForDate(selectedDate: string, docSnapshot: DocumentSnapshot) {
  if (!docSnapshot.exists()) return [];

  const userData = docSnapshot.data();
  const dayData = userData[selectedDate];
  return dayData?.userTodosOfDay ?? [];
}

export async function getTodoById(todoId: string, selectedDate: string, currentUser: User) {
  const docSnapshot = await getUserTodosDocSnapshot(currentUser.accountId);
  const todosOfDay = getTodosForDate(selectedDate, docSnapshot);

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

export async function updateOrCreateTodos(docRef: DocumentReference, selectedDate: string, todoItem: TodoItemBase, userData: DocumentData) {
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

  if (docSnapshot.exists()) {
    const userData = docSnapshot.data();
    await updateOrCreateTodos(docRef, selectedDate, todoItem, userData);
  } else {
    await setDoc(docRef, {
      [selectedDate]: {
        userTodosOfDay: [todoItem],
      },
      userInfo: currentUser,
    });
  }
}

export async function editTodo(todoId: string, newTodoDetails: Partial<TodoItemDetails>, selectedDate: string, currentUser: User, deleteImage: boolean) {
  const docRef = doc(db, TABLE_NAME_taskerUserTodos, currentUser.accountId);
  const docSnapshot = await getDoc(docRef);

  let newImageUrl = '';

  if (docSnapshot.exists()) {
    const userData = docSnapshot.data();
    if (userData[selectedDate]?.userTodosOfDay) {
      const updatedUserTodos = userData[selectedDate].userTodosOfDay.map((todo: TodoItemDetails) => {
        if (todo.id === todoId) {
          const updatedTodo: TodoItemDetails = {
            ...todo,
            todo: newTodoDetails.todo || todo.todo,
            todoMoreContent: newTodoDetails.todoMoreContent,
            imageUrl: deleteImage ? '' : newImageUrl || todo.imageUrl,
            updatedAt: new Date(),
          };
          return updatedTodo;
        }
        return todo;
      });

      await updateDoc(docRef, {
        [selectedDate]: {
          userTodosOfDay: updatedUserTodos,
        },
      });

      if (deleteImage) {
        const todoToDelete = userData[selectedDate].userTodosOfDay.find((todo: TodoItemDetails) => todo.id === todoId);
        if (todoToDelete && todoToDelete.imageUrl) {
          const imageRef = ref(storage, `todoImages/${currentUser.accountId}/${selectedDate}_${todoId}`);
          await deleteObject(imageRef);
        }
      } else if (newTodoDetails.imageUrl) {
        const imageRef = ref(storage, `todoImages/${currentUser.accountId}/${selectedDate}_${todoId}`);
        const uploadTask = uploadBytesResumable(imageRef, newTodoDetails.imageUrl as File);
        await uploadTask;
        newImageUrl = await getDownloadURL(uploadTask.snapshot.ref);

        await updateDoc(docRef, {
          [selectedDate]: {
            userTodosOfDay: updatedUserTodos.map((todo: TodoItemDetails) => (todo.id === todoId ? { ...todo, imageUrl: newImageUrl } : todo)),
          },
        });
      }
    }
  }
}

export async function updateTodoCompletionStatus(todoId: string, selectedDate: string, currentUser: User, isCompleted: boolean) {
  const docRef = doc(db, TABLE_NAME_taskerUserTodos, currentUser.accountId);
  const docSnapshot = await getDoc(docRef);

  if (docSnapshot.exists()) {
    const userData = docSnapshot.data();
    if (userData[selectedDate]?.userTodosOfDay) {
      const updatedTodos = userData[selectedDate].userTodosOfDay.map((todo: TodoItemDetails) => {
        if (todo.id === todoId) {
          return { ...todo, isCompleted, updatedAt: new Date() };
        }
        return todo;
      });

      await updateDoc(docRef, {
        [selectedDate]: {
          userTodosOfDay: updatedTodos,
        },
      });
    }
  }
}

export async function deleteTodo(todoId: string, selectedDate: string, currentUser: User) {
  const docRef = doc(db, TABLE_NAME_taskerUserTodos, currentUser.accountId);
  const docSnapshot = await getDoc(docRef);

  if (docSnapshot.exists()) {
    const userData = docSnapshot.data();
    if (userData[selectedDate]?.userTodosOfDay) {
      const updatedUserTodos = userData[selectedDate].userTodosOfDay.filter((todo: TodoItemDetails) => todo.id !== todoId);

      await updateDoc(docRef, {
        [selectedDate]: {
          userTodosOfDay: updatedUserTodos,
        },
      });

      const todoToDelete = userData[selectedDate].userTodosOfDay.find((todo: TodoItemDetails) => todo.id === todoId);
      if (todoToDelete && todoToDelete.imageUrl) {
        const imageRef = ref(storage, `todoImages/${currentUser.accountId}/${selectedDate}_${todoId}`);
        await deleteObject(imageRef);
      }
    }
  }
}

export async function searchInDatabase(searchValue: string, currentUser: User) {
  try {
    const docRef = doc(db, TABLE_NAME_taskerUserTodos, currentUser.accountId);
    const docSnapshot = await getDoc(docRef);

    const userData = docSnapshot.data();
    const searchResults: TodoItemDetailsGlobalSearch[] = [];

    if (userData) {
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
    }

    searchResults.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : convertTimestampToDate(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : convertTimestampToDate(b.createdAt);

      return dateB.getTime() - dateA.getTime();
    });

    return searchResults;
  } catch (error) {
    console.error('Error during database search:', error);
    throw error;
  }
}
