import {
  createTodoItem,
  deleteTodoImage,
  filterOutTodoById,
  findTodoById,
  getSearchResultsFromUserData,
  getTodoById,
  getTodosForDate,
  getTodosFromDay,
  getUserTodosDocSnapshot,
  handleTodoImageDelete,
  handleTodoImageUploadAndUpdate,
  removeExistingDateIfNoTodo,
  sortSearchResultsByDate,
  updateOrCreateTodos,
  updateTodosInDatabase,
  updateTodosList,
  updateTodoStatusInList,
  uploadImageAndGetUrl,
} from '@/api/apiTodos';
import { FILES_FOLDER_todoImages, TABLE_NAME_taskerUserTodos } from '@/lib/constants';
import { storage } from '@/lib/firebase.config';
import { getFirestoreDocRef } from '@/lib/firebaseHelpers';
import { TodoItemBase, TodoItemDetailsGlobalSearch, User } from '@/types/types';
import { DocumentSnapshot, DocumentReference, getDoc, DocumentData, updateDoc, deleteField } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, StorageReference, uploadBytesResumable, UploadTask } from 'firebase/storage';
import { it, expect, describe, vi } from 'vitest';

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteField: vi.fn(),
}));
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}));
vi.mock('@/lib/firebaseHelpers', () => ({
  getFirestoreDocRef: vi.fn(),
}));

describe('getTodosFromDay()', () => {
  it('should return an empty array when no todos exist for the given date', async () => {
    const mockUser = { accountId: '12345' } as User;
    const mockDate = '2023-10-01';
    const mockDocSnapshot = {
      exists: () => false,
    } as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const getFirestoreDocRefMocked = vi.mocked(getFirestoreDocRef);

    getDocMocked.mockResolvedValue(mockDocSnapshot);
    getFirestoreDocRefMocked.mockReturnValue({} as DocumentReference);

    const todos = await getTodosFromDay(mockDate, mockUser);

    expect(todos).toEqual([]);
  });

  it('should return todos if they exist for the given date', async () => {
    const mockUser = { accountId: '12345' } as User;
    const mockDate = '2023-10-01';
    const mockTodos = [{ id: 1, task: 'Test Task' }];
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        [mockDate]: {
          userTodosOfDay: [{ id: 1, task: 'Test Task' }],
        },
      }),
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const getFirestoreDocRefMocked = vi.mocked(getFirestoreDocRef);

    getDocMocked.mockResolvedValue(mockDocSnapshot);
    getFirestoreDocRefMocked.mockReturnValue({} as DocumentReference);

    const todos = await getTodosFromDay(mockDate, mockUser);

    expect(todos).toEqual(mockTodos);
  });
});

describe('getUserTodosDocSnapshot()', () => {
  it('should retrieve document snapshot for valid accountId', async () => {
    const mockAccountId = '12345';
    const mockDocSnapshot = { exists: () => true, data: () => ({}) } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const getFirestoreDocRefMocked = vi.mocked(getFirestoreDocRef);

    getDocMocked.mockResolvedValue(mockDocSnapshot);
    getFirestoreDocRefMocked.mockReturnValue({} as DocumentReference);

    const result = await getUserTodosDocSnapshot(mockAccountId);

    expect(result).toBe(mockDocSnapshot);
    expect(getFirestoreDocRefMocked).toHaveBeenCalledWith(TABLE_NAME_taskerUserTodos, mockAccountId);
    expect(getDocMocked).toHaveBeenCalledWith({});
  });
});

describe('getTodosForDate()', () => {
  it('should return todos for a given date when data exists', async () => {
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        '2023-10-10': {
          userTodosOfDay: [{ id: 1, task: 'Test Task' }],
        },
      }),
    } as unknown as DocumentSnapshot;

    const result = await getTodosForDate('2023-10-10', mockDocSnapshot);
    expect(result).toEqual([{ id: 1, task: 'Test Task' }]);
  });

  it('should return an empty array when there are no todos for the given date', async () => {
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        '2023-10-10': {
          userTodosOfDay: [],
        },
      }),
    } as unknown as DocumentSnapshot;

    const result = await getTodosForDate('2023-10-10', mockDocSnapshot);
    expect(result).toEqual([]);
  });
});

describe('getTodoById()', () => {
  it('should retrieve the correct todo item by ID for a given date and user', async () => {
    const mockUser = { accountId: '12345' } as User;
    const mockCreatedAt = new Date();
    const mockUpdatedAt = new Date();
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        '2023-10-10': {
          userTodosOfDay: [
            { id: 'todo1', todo: 'Test Todo 1', isCompleted: false, createdAt: mockCreatedAt, updatedAt: mockUpdatedAt },
            { id: 'todo2', todo: 'Test Todo 2', isCompleted: true, createdAt: mockCreatedAt, updatedAt: mockUpdatedAt },
          ],
        },
      }),
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const getFirestoreDocRefMocked = vi.mocked(getFirestoreDocRef);

    getDocMocked.mockResolvedValue(mockDocSnapshot);
    getFirestoreDocRefMocked.mockReturnValue({} as DocumentReference);

    const result = await getTodoById('todo1', '2023-10-10', mockUser);

    expect(result).toEqual({ id: 'todo1', todo: 'Test Todo 1', isCompleted: false, createdAt: mockCreatedAt, updatedAt: mockUpdatedAt });
  });

  it('should return an empty array if the document snapshot does not exist', async () => {
    const mockUser = { accountId: '12345' } as User;
    const mockDocSnapshot = {
      exists: () => false,
      data: () => null,
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const getFirestoreDocRefMocked = vi.mocked(getFirestoreDocRef);

    getDocMocked.mockResolvedValue(mockDocSnapshot);
    getFirestoreDocRefMocked.mockReturnValue({} as DocumentReference);

    const result = await getTodoById('todo1', '2023-10-10', mockUser);

    expect(result).toEqual(undefined);
  });
});

describe('uploadImageAndGetUrl', () => {
  it('should upload image and return download URL', async () => {
    const mockAccountId = '12345';
    const mockSelectedDate = '2023-10-01';
    const mockTodoId = 'abcde';
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const mockImageUrl = 'https://mockurl.com/image.png';

    const mockSnapshot = { ref: {} };
    const mockUploadTask = {
      snapshot: mockSnapshot,
      then: vi.fn((cb) => {
        cb(mockSnapshot);
        return Promise.resolve();
      }),
    };

    const refMocked = vi.mocked(ref);
    const uploadBytesResumableMocked = vi.mocked(uploadBytesResumable);
    const getDownloadURLMocked = vi.mocked(getDownloadURL);

    refMocked.mockReturnValue({} as StorageReference);
    uploadBytesResumableMocked.mockReturnValue(mockUploadTask as unknown as UploadTask);
    getDownloadURLMocked.mockResolvedValue(mockImageUrl);

    const result = await uploadImageAndGetUrl(mockAccountId, mockSelectedDate, mockTodoId, mockFile);

    expect(refMocked).toHaveBeenCalledWith(storage, `${FILES_FOLDER_todoImages}/${mockAccountId}/${mockSelectedDate}_${mockTodoId}`);
    expect(uploadBytesResumableMocked).toHaveBeenCalledWith({}, mockFile);
    expect(getDownloadURLMocked).toHaveBeenCalledWith(mockSnapshot.ref);
    expect(result).toBe(mockImageUrl);
  });
});

describe('createTodoItem()', () => {
  it('should create a todo item with all fields provided', () => {
    const mockTodoDetails = {
      todo: 'Test Todo',
      todoMoreContent: 'More content',
      imageUrl: new File([''], 'test.png'),
    };
    const mockTodoId = '12345';
    const mockImageUrl = 'http://example.com/test.png';

    const result = createTodoItem(mockTodoDetails, mockTodoId, mockImageUrl);

    expect(result).toEqual({
      id: mockTodoId,
      todo: 'Test Todo',
      todoMoreContent: 'More content',
      imageUrl: 'http://example.com/test.png',
      isCompleted: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

describe('updateOrCreateTodos()', () => {
  it('should update the todos for the given date if todos exist', async () => {
    const mockCurrentUser = { accountId: '12345' } as User;
    const mockDocRef = {} as DocumentReference;
    const mockSelectedDate = '2023-10-10';
    const mockTodoItem = { id: '1', task: 'Test Task' } as unknown as TodoItemBase;
    const mockUserData = {
      [mockSelectedDate]: {
        userTodosOfDay: [{ id: '0', task: 'Existing Task' }],
      },
    } as DocumentData;

    const updateDocMocked = vi.mocked(updateDoc);

    await updateOrCreateTodos(mockDocRef, mockSelectedDate, mockTodoItem, mockUserData, mockCurrentUser);

    expect(updateDocMocked).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: {
        userTodosOfDay: [...mockUserData[mockSelectedDate].userTodosOfDay, mockTodoItem],
      },
    });
  });

  it('should create new todos for the given date if no todos exist', async () => {
    const mockCurrentUser = { accountId: '12345' } as User;
    const mockDocRef = {} as DocumentReference;
    const mockSelectedDate = '2023-10-10';
    const mockTodoItem = { id: '1', task: 'Test Task' } as unknown as TodoItemBase;
    const mockUserData = {} as DocumentData;

    const updateDocMocked = vi.mocked(updateDoc);

    await updateOrCreateTodos(mockDocRef, mockSelectedDate, mockTodoItem, mockUserData, mockCurrentUser);

    expect(updateDocMocked).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: {
        userTodosOfDay: [mockTodoItem],
      },
      userInfo: mockCurrentUser,
    });
  });
});

describe('updateTodosList()', () => {
  it('should update the todo with the given id', () => {
    const mockTodoId = '1';
    const mockNewTodoDetails = {
      todo: 'Updated Task',
      todoMoreContent: 'Updated Content',
    };
    const mockTodosOfDay = [
      { id: '1', todo: 'Old Task', todoMoreContent: 'Old Content', imageUrl: 'oldImageUrl', updatedAt: new Date() },
      { id: '2', todo: 'Task 2', todoMoreContent: 'Content 2', imageUrl: 'imageUrl2', updatedAt: new Date() },
    ] as TodoItemBase[];
    const mockDeleteImage = false;

    const result = updateTodosList(mockTodoId, mockNewTodoDetails, mockTodosOfDay, mockDeleteImage);

    expect(result[0].todo).toBe('Updated Task');
    expect(result[0].todoMoreContent).toBe('Updated Content');
    expect(result[0].imageUrl).toBe('oldImageUrl');
    expect(result[0].updatedAt).not.toBe(mockTodosOfDay[0].updatedAt);
    expect(result[1]).toEqual(mockTodosOfDay[1]);
  });

  it('should delete the image URL if deleteImage is true', () => {
    const mockTodoId = '1';
    const mockNewTodoDetails = {
      todo: 'Updated Task',
      todoMoreContent: 'Updated Content',
    };
    const mockTodosOfDay = [
      { id: '1', todo: 'Old Task', todoMoreContent: 'Old Content', imageUrl: 'oldImageUrl', updatedAt: new Date() },
      { id: '2', todo: 'Task 2', todoMoreContent: 'Content 2', imageUrl: 'imageUrl2', updatedAt: new Date() },
    ] as TodoItemBase[];
    const mockDeleteImage = true;

    const result = updateTodosList(mockTodoId, mockNewTodoDetails, mockTodosOfDay, mockDeleteImage);

    expect(result[0].todo).toBe('Updated Task');
    expect(result[0].todoMoreContent).toBe('Updated Content');
    expect(result[0].imageUrl).toBe('');
    expect(result[0].updatedAt).not.toBe(mockTodosOfDay[0].updatedAt);
    expect(result[1]).toEqual(mockTodosOfDay[1]);
  });

  it('should not update the todo if the id does not match', () => {
    const mockTodoId = '3';
    const mockNewTodoDetails = {
      todo: 'Updated Task',
      todoMoreContent: 'Updated Content',
    };
    const mockTodosOfDay = [
      { id: '1', todo: 'Old Task', todoMoreContent: 'Old Content', imageUrl: 'oldImageUrl', updatedAt: new Date() },
      { id: '2', todo: 'Task 2', todoMoreContent: 'Content 2', imageUrl: 'imageUrl2', updatedAt: new Date() },
    ] as TodoItemBase[];
    const mockDeleteImage = false;

    const result = updateTodosList(mockTodoId, mockNewTodoDetails, mockTodosOfDay, mockDeleteImage);

    expect(result).toEqual(mockTodosOfDay);
  });
});

describe('updateTodosInDatabase()', () => {
  it('should update the document with the provided todos', async () => {
    const mockDocRef = {} as DocumentReference;
    const mockSelectedDate = '2023-10-10';
    const mockUpdatedUserTodos = [
      { id: '1', todo: 'Test Task 1', todoMoreContent: 'Content 1', imageUrl: 'url1', updatedAt: new Date() },
      { id: '2', todo: 'Test Task 2', todoMoreContent: 'Content 2', imageUrl: 'url2', updatedAt: new Date() },
    ] as TodoItemBase[];

    await updateTodosInDatabase(mockDocRef, mockSelectedDate, mockUpdatedUserTodos);

    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: {
        userTodosOfDay: mockUpdatedUserTodos,
      },
    });
  });
});

describe('handleTodoImageDelete()', () => {
  it('should delete the image if it exists for the todo item', async () => {
    const mockAccountId = '12345';
    const mockSelectedDate = '2023-10-10';
    const mockTodoId = 'todo1';
    const mockTodosOfDay = [
      { id: 'todo1', todo: 'Test Task', todoMoreContent: 'Content', imageUrl: 'http://example.com/image1.jpg', updatedAt: new Date() },
      { id: 'todo2', todo: 'Another Task', todoMoreContent: 'More Content', imageUrl: 'http://example.com/image2.jpg', updatedAt: new Date() },
    ] as TodoItemBase[];

    const expectedImageRef = {} as StorageReference;
    const refMocked = vi.mocked(ref);
    const deleteObjectMocked = vi.mocked(deleteObject);

    refMocked.mockReturnValue(expectedImageRef);
    deleteObjectMocked.mockResolvedValue(undefined);

    await handleTodoImageDelete(mockAccountId, mockSelectedDate, mockTodoId, mockTodosOfDay);

    expect(ref).toHaveBeenCalledWith(storage, `${FILES_FOLDER_todoImages}/${mockAccountId}/${mockSelectedDate}_${mockTodoId}`);

    expect(deleteObject).toHaveBeenCalledWith(expectedImageRef);
  });
});

describe('handleTodoImageUploadAndUpdate()', () => {
  it('should upload the image, update todos list with new image URL, and update the document', async () => {
    const mockDocRef = {} as DocumentReference;
    const mockTodoId = 'todo1';
    const mockImageFile = new File([''], 'image.jpg');
    const mockSelectedDate = '2023-10-10';
    const mockUpdatedUserTodos = [
      { id: 'todo1', todo: 'Test Task', todoMoreContent: 'Content', imageUrl: '', updatedAt: new Date() },
      { id: 'todo2', todo: 'Another Task', todoMoreContent: 'More Content', imageUrl: 'http://example.com/image2.jpg', updatedAt: new Date() },
    ] as TodoItemBase[];
    const mockNewImageUrl = 'http://example.com/new-image.jpg';
    const mockUploadTask = { snapshot: { ref: {} } } as UploadTask;

    const uploadBytesResumableMock = vi.mocked(uploadBytesResumable);
    const getDownloadURLMock = vi.mocked(getDownloadURL);
    const updateDocMock = vi.mocked(updateDoc);

    uploadBytesResumableMock.mockReturnValue(mockUploadTask);
    getDownloadURLMock.mockResolvedValue(mockNewImageUrl);
    updateDocMock.mockResolvedValue(undefined);

    await handleTodoImageUploadAndUpdate(mockDocRef, mockTodoId, mockImageFile, mockSelectedDate, mockUpdatedUserTodos, '12345');

    expect(uploadBytesResumable).toHaveBeenCalledWith(ref(storage, `${FILES_FOLDER_todoImages}/12345/${mockSelectedDate}_${mockTodoId}`), mockImageFile);
    expect(getDownloadURL).toHaveBeenCalledWith(mockUploadTask.snapshot.ref);
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: {
        userTodosOfDay: [
          { id: 'todo1', todo: 'Test Task', todoMoreContent: 'Content', imageUrl: mockNewImageUrl, updatedAt: expect.any(Date) },
          { id: 'todo2', todo: 'Another Task', todoMoreContent: 'More Content', imageUrl: 'http://example.com/image2.jpg', updatedAt: expect.any(Date) },
        ],
      },
    });
  });
});

describe('updateTodoStatusInList()', () => {
  const mockTodosOfDay = [
    { id: 'todo1', todo: 'Task 1', isCompleted: false },
    { id: 'todo2', todo: 'Task 2', isCompleted: true },
    { id: 'todo3', todo: 'Task 3', isCompleted: false },
  ] as TodoItemBase[];

  it('should update the isCompleted status of the specified todo item', () => {
    const mockTodoIdToUpdate = 'todo1';
    const mockIsCompleted = true;

    const updatedTodos = updateTodoStatusInList(mockTodoIdToUpdate, mockTodosOfDay, mockIsCompleted);

    const updatedTodo = updatedTodos.find((todo) => todo.id === mockTodoIdToUpdate);
    expect(updatedTodo).toBeDefined();
    expect(updatedTodo?.isCompleted).toBe(true);
    expect(updatedTodo?.updatedAt).toBeInstanceOf(Date);
  });

  it('should not modify other todo items', () => {
    const mockTodoIdToUpdate = 'todo1';
    const mockIsCompleted = true;

    const updatedTodos = updateTodoStatusInList(mockTodoIdToUpdate, mockTodosOfDay, mockIsCompleted);

    const otherTodos = updatedTodos.filter((todo) => todo.id !== mockTodoIdToUpdate);
    otherTodos.forEach((todo) => {
      const originalTodo = mockTodosOfDay.find((t) => t.id === todo.id);
      expect(todo.isCompleted).toBe(originalTodo?.isCompleted);
      expect(todo.updatedAt).toBeUndefined();
    });
  });
});

describe('removeExistingDateIfNoTodo()', () => {
  it('should remove the selected date field if no todos exist', async () => {
    const mockDocRef = {} as DocumentReference;
    const mockSelectedDate = '2023-10-10';

    await removeExistingDateIfNoTodo(mockDocRef, mockSelectedDate);

    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: deleteField(),
    });
  });
});

describe('filterOutTodoById()', () => {
  it('should filter out the todo with the given ID', () => {
    const mockTodos = [
      { id: '1', todo: 'Task 1' },
      { id: '2', todo: 'Task 2' },
    ] as TodoItemBase[];

    const result = filterOutTodoById(mockTodos, '1');

    expect(result).toEqual([{ id: '2', todo: 'Task 2' }]);
  });
});

describe('findTodoById()', () => {
  it('should find and return the todo with the given ID', () => {
    const mockTodos = [
      { id: '1', todo: 'Task 1' },
      { id: '2', todo: 'Task 2' },
    ] as TodoItemBase[];

    const result = findTodoById(mockTodos, '2');

    expect(result).toEqual({ id: '2', todo: 'Task 2' });
  });
});

describe('deleteTodoImage()', () => {
  it('should delete the image for the given todo', async () => {
    const mockAccountId = '12345';
    const mockSelectedDate = '2023-10-10';
    const mockTodoId = 'todo1';

    await deleteTodoImage(mockAccountId, mockSelectedDate, mockTodoId);

    expect(deleteObject).toHaveBeenCalled();
  });
});

describe('getSearchResultsFromUserData()', () => {
  it('should return filtered search results from user data', () => {
    const mockUserData = {
      '2023-10-10': {
        userTodosOfDay: [
          { id: '1', todo: 'Test Task 1', createdAt: new Date('2023-10-09') },
          { id: '2', todo: 'Another Task', createdAt: new Date('2023-10-10') },
        ],
      },
      '2023-10-11': {
        userTodosOfDay: [{ id: '3', todo: 'Test Task 2', createdAt: new Date('2023-10-11') }],
      },
    };

    const mockSearchValue = 'Test';
    const expectedResults = [
      { id: '1', todo: 'Test Task 1', createdAt: new Date('2023-10-09'), todoDate: '2023-10-10', todoSearchValue: 'Test' },
      { id: '3', todo: 'Test Task 2', createdAt: new Date('2023-10-11'), todoDate: '2023-10-11', todoSearchValue: 'Test' },
    ];

    const result = getSearchResultsFromUserData(mockUserData, mockSearchValue);
    expect(result).toEqual(expectedResults);
  });
});

describe('sortSearchResultsByDate()', () => {
  it('should sort search results by date in descending order', () => {
    const mockSearchResults = [
      { id: '1', todo: 'Test Task 1', createdAt: new Date('2023-10-09') },
      { id: '2', todo: 'Another Task', createdAt: new Date('2023-10-11') },
      { id: '3', todo: 'Test Task 2', createdAt: new Date('2023-10-10') },
    ] as TodoItemDetailsGlobalSearch[];

    const expectedResults = [
      { id: '2', todo: 'Another Task', createdAt: new Date('2023-10-11') },
      { id: '3', todo: 'Test Task 2', createdAt: new Date('2023-10-10') },
      { id: '1', todo: 'Test Task 1', createdAt: new Date('2023-10-09') },
    ] as TodoItemDetailsGlobalSearch[];

    const result = sortSearchResultsByDate(mockSearchResults);
    expect(result).toEqual(expectedResults);
  });
});
