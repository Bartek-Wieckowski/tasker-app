import { db, storage } from '@/lib/firebase.config';
import { TodoItem, TodoItemDetails, User } from '@/types/types';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

export async function getTodosFromDay(selectedDate: string, currentUser: User): Promise<TodoItemDetails[]> {
  const docRef = doc(db, 'taskerUserTodos', currentUser.accountId);
  const docSnapshot = await getDoc(docRef);

  if (docSnapshot.exists()) {
    const userData = docSnapshot.data();
    if (userData[selectedDate]?.userTodosOfDay) {
      return userData[selectedDate].userTodosOfDay;
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getTodoById(todoId: string, selectedDate: string, currentUser: User): Promise<TodoItemDetails | undefined> {
  const docRef = doc(db, 'taskerUserTodos', currentUser.accountId);
  const docSnapshot = await getDoc(docRef);

  if (docSnapshot.exists()) {
    const userData = docSnapshot.data();
    if (userData[selectedDate]?.userTodosOfDay) {
      const todosOfDay = userData[selectedDate].userTodosOfDay;
      const todo = todosOfDay.find((todo: TodoItemDetails) => todo.id === todoId);
      return todo;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

export async function addTodo(todoDetails: TodoItem, selectedDate: string, currentUser: User) {
  const docRef = doc(db, 'taskerUserTodos', currentUser.accountId);
  const docSnapshot = await getDoc(docRef);

  const todoId = crypto.randomUUID();
  const timestamp = new Date();

  let imageUrl = '';

  if (todoDetails.imageUrl) {
    const imageRef = ref(storage, `todoImages/${currentUser.accountId}/${selectedDate}_${todoId}`);
    const uploadTask = uploadBytesResumable(imageRef, todoDetails.imageUrl as File);

    await uploadTask;

    imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
  }

  const todoItem = {
    id: todoId,
    todo: todoDetails.todo,
    todoMoreContent: todoDetails.todoMoreContent,
    imageUrl: imageUrl,
    isCompleted: false,
    createdAt: timestamp,
    updatedAt: '',
  };

  if (docSnapshot.exists()) {
    const userData = docSnapshot.data();
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
  const docRef = doc(db, 'taskerUserTodos', currentUser.accountId);
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
  const docRef = doc(db, 'taskerUserTodos', currentUser.accountId);
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
  const docRef = doc(db, 'taskerUserTodos', currentUser.accountId);
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
