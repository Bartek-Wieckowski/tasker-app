import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase.config';
import { TodoItemBase } from '@/types/types';
import { getFirestoreDocRef } from '@/lib/firebaseHelpers';
import { format } from 'date-fns';
import {
  TABLE_NAME_taskerGlobalTodos,
  TABLE_NAME_taskerUserTodos,
} from '@/lib/constants';

export async function addGlobalTodo(todo: { todo: string }, userId: string) {
  const userGlobalTodosRef = doc(
    collection(db, TABLE_NAME_taskerGlobalTodos),
    userId
  );
  const docSnapshot = await getDoc(userGlobalTodosRef);

  const newTodo: Omit<TodoItemBase, 'imageUrl'> & { imageUrl: string } = {
    id: crypto.randomUUID(),
    todo: todo.todo,
    isCompleted: false,
    createdAt: new Date(),
    imageUrl: '',
    todoMoreContent: '',
  };

  if (docSnapshot.exists()) {
    await setDoc(
      userGlobalTodosRef,
      {
        userGlobalTodos: [...docSnapshot.data().userGlobalTodos, newTodo],
      },
      { merge: true }
    );
  } else {
    await setDoc(userGlobalTodosRef, {
      userGlobalTodos: [newTodo],
    });
  }

  return newTodo;
}

export async function getGlobalTodos(userId: string) {
  const userGlobalTodosRef = doc(
    collection(db, TABLE_NAME_taskerGlobalTodos),
    userId
  );
  const docSnapshot = await getDoc(userGlobalTodosRef);

  if (!docSnapshot.exists()) {
    return [];
  }

  return docSnapshot.data().userGlobalTodos;
}

export async function assignGlobalTodoToDay(
  globalTodoId: string,
  date: Date,
  userId: string
) {
  const userGlobalTodosRef = doc(
    collection(db, TABLE_NAME_taskerGlobalTodos),
    userId
  );
  const docSnapshot = await getDoc(userGlobalTodosRef);

  if (!docSnapshot.exists()) return;

  const globalTodos = docSnapshot.data().userGlobalTodos;
  const globalTodo = globalTodos.find(
    (todo: TodoItemBase) => todo.id === globalTodoId
  );

  if (!globalTodo) return;

  const userTodosRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, userId);
  const userTodosSnapshot = await getDoc(userTodosRef);

  const newTodo: Omit<TodoItemBase, 'imageUrl'> & { imageUrl: string } = {
    id: crypto.randomUUID(),
    todo: globalTodo.todo,
    todoMoreContent: globalTodo.todoMoreContent || '',
    imageUrl:
      typeof globalTodo.imageUrl === 'string' ? globalTodo.imageUrl : '',
    isCompleted: false,
    createdAt: new Date(),
  };

  const formattedDate = format(date, 'dd-MM-yyyy');

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

  const updatedGlobalTodos = globalTodos.filter(
    (todo: TodoItemBase) => todo.id !== globalTodoId
  );
  await setDoc(userGlobalTodosRef, {
    userGlobalTodos: updatedGlobalTodos,
  });
}

export async function editGlobalTodo(
  todoId: string,
  newTodoName: string,
  accountId: string
) {
  const userGlobalTodosRef = doc(
    collection(db, TABLE_NAME_taskerGlobalTodos),
    accountId
  );
  const docSnapshot = await getDoc(userGlobalTodosRef);

  if (!docSnapshot.exists()) return;

  const globalTodos = docSnapshot.data().userGlobalTodos;
  const updatedGlobalTodos = globalTodos.map((todo: TodoItemBase) =>
    todo.id === todoId ? { ...todo, todo: newTodoName } : todo
  );

  await setDoc(userGlobalTodosRef, {
    userGlobalTodos: updatedGlobalTodos,
  });
}

export async function deleteGlobalTodo(todoId: string, accountId: string) {
  const userGlobalTodosRef = doc(
    collection(db, TABLE_NAME_taskerGlobalTodos),
    accountId
  );
  const docSnapshot = await getDoc(userGlobalTodosRef);

  if (!docSnapshot.exists()) return;

  const globalTodos = docSnapshot.data().userGlobalTodos;
  const updatedGlobalTodos = globalTodos.filter(
    (todo: TodoItemBase) => todo.id !== todoId
  );

  await setDoc(userGlobalTodosRef, {
    userGlobalTodos: updatedGlobalTodos,
  });
}
