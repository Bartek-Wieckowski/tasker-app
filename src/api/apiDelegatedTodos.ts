import { collection, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase.config';
import { TodoItemBase } from '@/types/types';
import { getFirestoreDocRef } from '@/lib/firebaseHelpers';
import { format } from 'date-fns';
import {
  TABLE_NAME_taskerDelegatedTodos,
  TABLE_NAME_taskerUserTodos,
} from '@/lib/constants';
import {  handleImageDeletion } from './apiTodos';

export async function addDelegatedTodo(todo: { todo: string; imageUrl?: File }, userId: string) {
  const userDelegatedTodosRef = doc(
    collection(db, TABLE_NAME_taskerDelegatedTodos),
    userId
  );
  const docSnapshot = await getDoc(userDelegatedTodosRef);

  const todoId = crypto.randomUUID();
  const newTodo: Omit<TodoItemBase, 'imageUrl'> & { imageUrl: string } = {
    id: todoId,
    todo: todo.todo,
    isCompleted: false,
    createdAt: new Date(),
    imageUrl: '',
    todoMoreContent: '',
    ...(todo.imageUrl && {
      imageInfo: {
        storageId: crypto.randomUUID(),
        isOriginal: true,
        sourceId: ""
      }
    })
  };

  if (docSnapshot.exists()) {
    await setDoc(
      userDelegatedTodosRef,
      {
        userDelegatedTodos: [...docSnapshot.data().userDelegatedTodos, newTodo],
      },
      { merge: true }
    );
  } else {
    await setDoc(userDelegatedTodosRef, {
      userDelegatedTodos: [newTodo],
    });
  }

  return newTodo;
}

export async function getDelegatedTodos(userId: string) {
  const userDelegatedTodosRef = doc(
    collection(db, TABLE_NAME_taskerDelegatedTodos),
    userId
  );
  const docSnapshot = await getDoc(userDelegatedTodosRef);

  if (!docSnapshot.exists()) {
    return [];
  }

  return docSnapshot.data().userDelegatedTodos;
}

export async function assignDelegatedTodoToDay(
  delegatedTodoId: string,
  date: Date,
  userId: string
) {
  const userDelegatedTodosRef = doc(
    collection(db, TABLE_NAME_taskerDelegatedTodos),
    userId
  );
  const docSnapshot = await getDoc(userDelegatedTodosRef);

  if (!docSnapshot.exists()) return;

  const delegatedTodos = docSnapshot.data().userDelegatedTodos;
  const delegatedTodo = delegatedTodos.find(
    (todo: TodoItemBase) => todo.id === delegatedTodoId
  );

  if (!delegatedTodo) return;

  const userTodosRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, userId);
  const userTodosSnapshot = await getDoc(userTodosRef);
  const formattedDate = format(date, 'dd-MM-yyyy');

  const newTodo: TodoItemBase = {
    id: delegatedTodoId,
    todo: delegatedTodo.todo,
    todoMoreContent: delegatedTodo.todoMoreContent || '',
    imageUrl: delegatedTodo.imageUrl,
    isCompleted: false,
    createdAt: new Date(),
    originalTodoId: delegatedTodo.originalTodoId || delegatedTodoId,
    isIndependentEdit: false,
    fromDelegated: true
  };

  if (userTodosSnapshot.exists()) {
    const userData = userTodosSnapshot.data();
    await setDoc(
      userTodosRef,
      {
        ...userData,
        [formattedDate]: {
          userTodosOfDay: [
            ...(userData[formattedDate]?.userTodosOfDay || []),
            newTodo,
          ],
        },
      },
      { merge: true }
    );
  } else {
    await setDoc(userTodosRef, {
      [formattedDate]: {
        userTodosOfDay: [newTodo],
      },
    });
  }

  const updatedDelegatedTodos = delegatedTodos.filter(
    (todo: TodoItemBase) => todo.id !== delegatedTodoId
  );
  
  if (updatedDelegatedTodos.length === 0) {
    await deleteDoc(userDelegatedTodosRef);
  } else {
    await setDoc(userDelegatedTodosRef, {
      userDelegatedTodos: updatedDelegatedTodos,
    });
  }

  return newTodo;
}

export async function editDelegatedTodo(
  todoId: string,
  newTodoName: string,
  accountId: string
) {
  const userDelegatedTodosRef = doc(
    collection(db, TABLE_NAME_taskerDelegatedTodos),
    accountId
  );
  const docSnapshot = await getDoc(userDelegatedTodosRef);

  if (!docSnapshot.exists()) return;

  const delegatedTodos = docSnapshot.data().userDelegatedTodos;
  const updatedDelegatedTodos = delegatedTodos.map((todo: TodoItemBase) =>
    todo.id === todoId ? { ...todo, todo: newTodoName } : todo
  );

  await setDoc(userDelegatedTodosRef, {
    userDelegatedTodos: updatedDelegatedTodos,
  });
}

export async function deleteDelegatedTodo(todoId: string, accountId: string) {
  const userDelegatedTodosRef = doc(
    collection(db, TABLE_NAME_taskerDelegatedTodos),
    accountId
  );
  const docSnapshot = await getDoc(userDelegatedTodosRef);

  if (!docSnapshot.exists()) return;

  const delegatedTodos = docSnapshot.data().userDelegatedTodos;
  const todoToDelete = delegatedTodos.find(
    (todo: TodoItemBase) => todo.id === todoId
  );

  if (todoToDelete?.imageUrl && !todoToDelete.fromDelegated) {
    await handleImageDeletion(accountId, todoToDelete.imageUrl, todoId);
  }

  const updatedDelegatedTodos = delegatedTodos.filter(
    (todo: TodoItemBase) => todo.id !== todoId
  );

  await setDoc(userDelegatedTodosRef, {
    userDelegatedTodos: updatedDelegatedTodos,
  });
} 