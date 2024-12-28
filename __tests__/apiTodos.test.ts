import {
  createTodoItem,
  deleteTodo,
  editTodo,
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
  moveTodo,
  updateAllRelatedTodos,
  repeatTodo,
} from '@/api/apiTodos';
import {
  FILES_FOLDER_todoImages,
  TABLE_NAME_taskerUserTodos,
} from '@/lib/constants';
import { storage } from '@/lib/firebase.config';
import { getFirestoreDocRef } from '@/lib/firebaseHelpers';
import {
  TodoItemBase,
  TodoItemDetails,
  TodoItemDetailsGlobalSearch,
  User,
} from '@/types/types';
import {
  DocumentSnapshot,
  DocumentReference,
  getDoc,
  updateDoc,
  deleteField,
  setDoc,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  StorageReference,
  uploadBytesResumable,
  UploadTask,
} from 'firebase/storage';
import { it, expect, describe, vi, beforeEach } from 'vitest';

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
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({}),
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const getFirestoreDocRefMocked = vi.mocked(getFirestoreDocRef);

    getDocMocked.mockResolvedValue(mockDocSnapshot);
    getFirestoreDocRefMocked.mockReturnValue({} as DocumentReference);

    const result = await getUserTodosDocSnapshot(mockAccountId);

    expect(result).toBe(mockDocSnapshot);
    expect(getFirestoreDocRefMocked).toHaveBeenCalledWith(
      TABLE_NAME_taskerUserTodos,
      mockAccountId
    );
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
            {
              id: 'todo1',
              todo: 'Test Todo 1',
              isCompleted: false,
              createdAt: mockCreatedAt,
              updatedAt: mockUpdatedAt,
            },
            {
              id: 'todo2',
              todo: 'Test Todo 2',
              isCompleted: true,
              createdAt: mockCreatedAt,
              updatedAt: mockUpdatedAt,
            },
          ],
        },
      }),
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const getFirestoreDocRefMocked = vi.mocked(getFirestoreDocRef);

    getDocMocked.mockResolvedValue(mockDocSnapshot);
    getFirestoreDocRefMocked.mockReturnValue({} as DocumentReference);

    const result = await getTodoById('todo1', '2023-10-10', mockUser);

    expect(result).toEqual({
      id: 'todo1',
      todo: 'Test Todo 1',
      isCompleted: false,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
    });
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
    uploadBytesResumableMocked.mockReturnValue(
      mockUploadTask as unknown as UploadTask
    );
    getDownloadURLMocked.mockResolvedValue(mockImageUrl);

    const result = await uploadImageAndGetUrl(
      mockAccountId,
      mockSelectedDate,
      mockTodoId,
      mockFile
    );

    expect(refMocked).toHaveBeenCalledWith(
      storage,
      `${FILES_FOLDER_todoImages}/${mockAccountId}/${mockSelectedDate}_${mockTodoId}`
    );
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
    });
  });
});

describe('updateOrCreateTodos()', () => {
  it('should create new todos for the given date if no todos exist', async () => {
    const mockCurrentUser = { accountId: '12345' } as User;
    const mockDocRef = {} as DocumentReference;
    const mockSelectedDate = '2023-10-10';
    const mockTodoItem = {
      id: '1',
      todo: 'Test Task',
    } as TodoItemBase;
    const mockUserData = undefined;

    const setDocMocked = vi.mocked(setDoc);

    await updateOrCreateTodos(
      mockDocRef,
      mockSelectedDate,
      mockTodoItem,
      mockUserData,
      mockCurrentUser
    );

    expect(setDocMocked).toHaveBeenCalledWith(
      mockDocRef,
      {
      [mockSelectedDate]: {
          userTodosOfDay: [mockTodoItem],
      },
        userInfo: mockCurrentUser,
      },
      { merge: true }
    );
  });

  it('should update existing todos for the given date', async () => {
    const mockCurrentUser = { accountId: '12345' } as User;
    const mockDocRef = {} as DocumentReference;
    const mockSelectedDate = '2023-10-10';
    const mockTodoItem = {
      id: '2',
      todo: 'New Task',
    } as TodoItemBase;
    const mockUserData = {
      [mockSelectedDate]: {
        userTodosOfDay: [{ id: '1', todo: 'Existing Task' }],
      },
    };

    const updateDocMocked = vi.mocked(updateDoc);

    await updateOrCreateTodos(
      mockDocRef,
      mockSelectedDate,
      mockTodoItem,
      mockUserData,
      mockCurrentUser
    );

    expect(updateDocMocked).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: {
        userTodosOfDay: [
          { id: '1', todo: 'Existing Task' },
          mockTodoItem,
        ],
      },
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
      {
        id: '1',
        todo: 'Old Task',
        todoMoreContent: 'Old Content',
        imageUrl: 'oldImageUrl',
        updatedAt: new Date(),
      },
      {
        id: '2',
        todo: 'Task 2',
        todoMoreContent: 'Content 2',
        imageUrl: 'imageUrl2',
        updatedAt: new Date(),
      },
    ] as TodoItemBase[];
    const mockDeleteImage = false;

    const result = updateTodosList(
      mockTodoId,
      mockNewTodoDetails,
      mockTodosOfDay,
      mockDeleteImage
    );

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
      {
        id: '1',
        todo: 'Old Task',
        todoMoreContent: 'Old Content',
        imageUrl: 'oldImageUrl',
        updatedAt: new Date(),
      },
      {
        id: '2',
        todo: 'Task 2',
        todoMoreContent: 'Content 2',
        imageUrl: 'imageUrl2',
        updatedAt: new Date(),
      },
    ] as TodoItemBase[];
    const mockDeleteImage = true;

    const result = updateTodosList(
      mockTodoId,
      mockNewTodoDetails,
      mockTodosOfDay,
      mockDeleteImage
    );

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
      {
        id: '1',
        todo: 'Old Task',
        todoMoreContent: 'Old Content',
        imageUrl: 'oldImageUrl',
        updatedAt: new Date(),
      },
      {
        id: '2',
        todo: 'Task 2',
        todoMoreContent: 'Content 2',
        imageUrl: 'imageUrl2',
        updatedAt: new Date(),
      },
    ] as TodoItemBase[];
    const mockDeleteImage = false;

    const result = updateTodosList(
      mockTodoId,
      mockNewTodoDetails,
      mockTodosOfDay,
      mockDeleteImage
    );

    expect(result).toEqual(mockTodosOfDay);
  });
});

describe('updateTodosInDatabase()', () => {
  it('should update the document with the provided todos', async () => {
    const mockDocRef = {} as DocumentReference;
    const mockSelectedDate = '2023-10-10';
    const mockUpdatedUserTodos = [
      {
        id: '1',
        todo: 'Test Task 1',
        todoMoreContent: 'Content 1',
        imageUrl: 'url1',
        updatedAt: new Date(),
      },
      {
        id: '2',
        todo: 'Test Task 2',
        todoMoreContent: 'Content 2',
        imageUrl: 'url2',
        updatedAt: new Date(),
      },
    ] as TodoItemBase[];

    await updateTodosInDatabase(
      mockDocRef,
      mockSelectedDate,
      mockUpdatedUserTodos
    );

    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: {
        userTodosOfDay: mockUpdatedUserTodos,
      },
    });
  });
});

describe('handleTodoImageDelete()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete the image for the given todo', async () => {
    const mockAccountId = '12345';
    const mockSelectedDate = '2023-10-10';
    const mockTodoId = 'todo1';
    const mockTodosOfDay = [
      {
        id: 'todo1',
        imageUrl: 'http://example.com/image.jpg',
      },
    ] as TodoItemDetails[];

    const refMocked = vi.mocked(ref);
    const deleteObjectMocked = vi.mocked(deleteObject);
    const mockStorageRef = {} as StorageReference;

    refMocked.mockReturnValue(mockStorageRef);
    deleteObjectMocked.mockResolvedValue(undefined);

    await handleTodoImageDelete(
      mockAccountId,
      mockSelectedDate,
      mockTodoId,
      mockTodosOfDay
    );

    expect(ref).toHaveBeenCalledWith(
      storage,
      `${FILES_FOLDER_todoImages}/${mockAccountId}/${mockSelectedDate}_${mockTodoId}`
    );
    expect(deleteObject).toHaveBeenCalledWith(mockStorageRef);
  });

  it('should not delete storage file if todo has no image url', async () => {
    const mockAccountId = '12345';
    const mockSelectedDate = '2023-10-10';
    const mockTodoId = 'todo1';
    const mockTodosOfDay = [
      {
        id: 'todo1',
        imageUrl: '',
      },
    ] as TodoItemDetails[];

    vi.clearAllMocks();

    await handleTodoImageDelete(
      mockAccountId,
      mockSelectedDate,
      mockTodoId,
      mockTodosOfDay
    );

    expect(deleteObject).not.toHaveBeenCalled();
    expect(ref).not.toHaveBeenCalled();
  });
});

describe('handleTodoImageUploadAndUpdate()', () => {
  it('should upload the image, update todos list with new image URL, and update the document', async () => {
    const mockDocRef = {} as DocumentReference;
    const mockTodoId = 'todo1';
    const mockImageFile = new File([''], 'image.jpg');
    const mockSelectedDate = '2023-10-10';
    const mockUpdatedUserTodos = [
      {
        id: 'todo1',
        todo: 'Test Task',
        todoMoreContent: 'Content',
        imageUrl: '',
        updatedAt: new Date(),
      },
      {
        id: 'todo2',
        todo: 'Another Task',
        todoMoreContent: 'More Content',
        imageUrl: 'http://example.com/image2.jpg',
        updatedAt: new Date(),
      },
    ] as TodoItemBase[];
    const mockNewImageUrl = 'http://example.com/new-image.jpg';
    const mockUploadTask = { snapshot: { ref: {} } } as UploadTask;

    const uploadBytesResumableMock = vi.mocked(uploadBytesResumable);
    const getDownloadURLMock = vi.mocked(getDownloadURL);
    const updateDocMock = vi.mocked(updateDoc);

    uploadBytesResumableMock.mockReturnValue(mockUploadTask);
    getDownloadURLMock.mockResolvedValue(mockNewImageUrl);
    updateDocMock.mockResolvedValue(undefined);

    await handleTodoImageUploadAndUpdate(
      mockDocRef,
      mockTodoId,
      mockImageFile,
      mockSelectedDate,
      mockUpdatedUserTodos,
      '12345'
    );

    expect(uploadBytesResumable).toHaveBeenCalledWith(
      ref(
        storage,
        `${FILES_FOLDER_todoImages}/12345/${mockSelectedDate}_${mockTodoId}`
      ),
      mockImageFile
    );
    expect(getDownloadURL).toHaveBeenCalledWith(mockUploadTask.snapshot.ref);
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: {
        userTodosOfDay: [
          {
            id: 'todo1',
            todo: 'Test Task',
            todoMoreContent: 'Content',
            imageUrl: mockNewImageUrl,
            updatedAt: expect.any(Date),
          },
          {
            id: 'todo2',
            todo: 'Another Task',
            todoMoreContent: 'More Content',
            imageUrl: 'http://example.com/image2.jpg',
            updatedAt: expect.any(Date),
          },
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

    const updatedTodos = updateTodoStatusInList(
      mockTodoIdToUpdate,
      mockTodosOfDay,
      mockIsCompleted
    );

    const updatedTodo = updatedTodos.find(
      (todo) => todo.id === mockTodoIdToUpdate
    );
    expect(updatedTodo).toBeDefined();
    expect(updatedTodo?.isCompleted).toBe(true);
    expect(updatedTodo?.updatedAt).toBeInstanceOf(Date);
  });

  it('should not modify other todo items', () => {
    const mockTodoIdToUpdate = 'todo1';
    const mockIsCompleted = true;

    const updatedTodos = updateTodoStatusInList(
      mockTodoIdToUpdate,
      mockTodosOfDay,
      mockIsCompleted
    );

    const otherTodos = updatedTodos.filter(
      (todo) => todo.id !== mockTodoIdToUpdate
    );
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
        userTodosOfDay: [
          { id: '3', todo: 'Test Task 2', createdAt: new Date('2023-10-11') },
        ],
      },
    };

    const mockSearchValue = 'Test';
    const expectedResults = [
      {
        id: '1',
        todo: 'Test Task 1',
        createdAt: new Date('2023-10-09'),
        todoDate: '2023-10-10',
        todoSearchValue: 'Test',
      },
      {
        id: '3',
        todo: 'Test Task 2',
        createdAt: new Date('2023-10-11'),
        todoDate: '2023-10-11',
        todoSearchValue: 'Test',
      },
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

describe('handleTodoImageDelete() with repeated todos', () => {
  it('should clear imageUrl and set isIndependentEdit when deleting image from repeated todo', async () => {
    const mockAccountId = '12345';
    const mockSelectedDate = '2023-10-10';
    const mockTodoId = 'todo1';
    const mockOriginalTodoId = 'originalTodo1';
    const mockTodosOfDay = [
      {
        id: 'todo1',
        todo: 'Test Task',
        imageUrl: 'http://example.com/image1.jpg',
        originalTodoId: mockOriginalTodoId,
      },
    ] as TodoItemBase[];

    const docRef = {} as DocumentReference;
    const getFirestoreDocRefMocked = vi.mocked(getFirestoreDocRef);
    getFirestoreDocRefMocked.mockReturnValue(docRef);

    await handleTodoImageDelete(
      mockAccountId,
      mockSelectedDate,
      mockTodoId,
      mockTodosOfDay,
      mockOriginalTodoId
    );

    expect(updateDoc).toHaveBeenCalledWith(docRef, {
      [mockSelectedDate]: {
        userTodosOfDay: [
          {
            ...mockTodosOfDay[0],
            imageUrl: '',
            isIndependentEdit: true,
          },
        ],
      },
    });
  });

  it('should delete image file when independent repeated todo has its own image', async () => {
    const mockAccountId = '12345';
    const mockSelectedDate = '2023-10-10';
    const mockTodoId = 'todo1';
    const mockOriginalTodoId = 'originalTodo1';
    const mockTodosOfDay = [
      {
        id: 'todo1',
        todo: 'Test Task',
        imageUrl: 'http://example.com/todo1.jpg',
        originalTodoId: mockOriginalTodoId,
        isIndependentEdit: true,
      },
    ] as TodoItemBase[];

    await handleTodoImageDelete(
      mockAccountId,
      mockSelectedDate,
      mockTodoId,
      mockTodosOfDay,
      mockOriginalTodoId
    );

    expect(deleteObject).toHaveBeenCalled();
  });
});

describe('editTodo() with repeated todos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update original todo and all dependent repeated todos', async () => {
    const mockTodoId = 'originalTodo1';
    const mockNewTodoDetails = {
      todo: 'Updated Task',
      todoMoreContent: 'Updated Content',
    };
    const mockSelectedDate = '2023-10-10';
    const mockCurrentUser = { accountId: '12345' } as User;

    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        '2023-10-10': {
          userTodosOfDay: [{ id: 'originalTodo1', todo: 'Original Task' }],
        },
        '2023-10-11': {
          userTodosOfDay: [
            {
              id: 'repeatedTodo1',
              todo: 'Original Task',
              originalTodoId: 'originalTodo1',
            },
          ],
        },
      }),
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const updateDocMocked = vi.mocked(updateDoc);
    getDocMocked.mockResolvedValue(mockDocSnapshot);

    await editTodo(
      mockTodoId,
      mockNewTodoDetails,
      mockSelectedDate,
      mockCurrentUser,
      false
    );

    expect(updateDocMocked).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        '2023-10-11': {
          userTodosOfDay: [
            expect.objectContaining({
              todo: 'Updated Task',
              todoMoreContent: 'Updated Content',
            }),
          ],
        },
      })
    );
  });

  it('should not update independent repeated todos when editing original todo', async () => {
    const mockTodoId = 'originalTodo1';
    const mockNewTodoDetails = {
      todo: 'Updated Task',
    };
    const mockSelectedDate = '2023-10-10';
    const mockCurrentUser = { accountId: '12345' } as User;

    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        '2023-10-10': {
          userTodosOfDay: [{ id: 'originalTodo1', todo: 'Original Task' }],
        },
      }),
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    getDocMocked.mockResolvedValue(mockDocSnapshot);

    await editTodo(
      mockTodoId,
      mockNewTodoDetails,
      mockSelectedDate,
      mockCurrentUser,
      false
    );

    const updateDocCalls = vi.mocked(updateDoc).mock.calls;
    const hasUnwantedUpdate = updateDocCalls.some((call) => {
      const data = call[1] as unknown as Record<string, unknown>;
      return Object.keys(data).includes('2023-10-11');
    });

    expect(hasUnwantedUpdate).toBe(false);
  });
});

describe('deleteTodo() with repeated todos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should clear imageUrl in all dependent repeated todos when deleting original todo', async () => {
    const mockTodoId = 'originalTodo1';
    const mockSelectedDate = '2023-10-10';
    const mockCurrentUser = { accountId: '12345' } as User;

    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        '2023-10-10': {
          userTodosOfDay: [
            {
              id: 'originalTodo1',
              todo: 'Original Task',
              imageUrl: 'http://example.com/original.jpg',
            },
          ],
        },
        '2023-10-11': {
          userTodosOfDay: [
            {
              id: 'repeatedTodo1',
              todo: 'Repeated Task',
              imageUrl: 'http://example.com/original.jpg',
              originalTodoId: 'originalTodo1',
            },
          ],
        },
      }),
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const updateDocMocked = vi.mocked(updateDoc);
    getDocMocked.mockResolvedValue(mockDocSnapshot);

    await deleteTodo(mockTodoId, mockSelectedDate, mockCurrentUser);

    expect(updateDocMocked).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        '2023-10-11': {
          userTodosOfDay: [
            expect.objectContaining({
              imageUrl: '',
            }),
          ],
        },
      })
    );
  });

  it('should not affect independent repeated todos with different images when deleting original todo', async () => {
    const mockTodoId = 'originalTodo1';
    const mockSelectedDate = '2023-10-10';
    const mockCurrentUser = { accountId: '12345' } as User;

    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        '2023-10-10': {
          userTodosOfDay: [
            {
              id: 'originalTodo1',
              todo: 'Original Task',
              imageUrl: 'http://example.com/original.jpg',
            },
          ],
        },
        '2023-10-11': {
          userTodosOfDay: [
            {
              id: 'repeatedTodo1',
              todo: 'Independent Task',
              imageUrl: 'http://example.com/different.jpg',
              originalTodoId: 'originalTodo1',
              isIndependentEdit: true,
            },
          ],
        },
      }),
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const updateDocMocked = vi.mocked(updateDoc);
    getDocMocked.mockResolvedValue(mockDocSnapshot);

    await deleteTodo(mockTodoId, mockSelectedDate, mockCurrentUser);

    expect(updateDocMocked).not.toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        '2023-10-11': expect.any(Object),
      })
    );
  });
});

describe('moveTodo()', () => {
  it('should move todo to new date and set originalDate', async () => {
    const mockTodoDetails = {
      id: 'todo1',
      todo: 'Test Todo',
      imageUrl: 'http://example.com/image.jpg',
      isCompleted: false,
    } as TodoItemDetails;
    const mockNewDate = '2023-10-11';
    const mockOriginalDate = '2023-10-10';
    const mockCurrentUser = { accountId: '12345' } as User;

    const mockDocRef = {} as DocumentReference;
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        [mockOriginalDate]: {
          userTodosOfDay: [mockTodoDetails],
        },
        userInfo: mockCurrentUser,
      }),
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const updateDocMocked = vi.mocked(updateDoc);
    const getFirestoreDocRefMocked = vi.mocked(getFirestoreDocRef);
    const setDocMocked = vi.mocked(setDoc);

    getDocMocked.mockResolvedValue(mockDocSnapshot);
    getFirestoreDocRefMocked.mockReturnValue(mockDocRef);

    await moveTodo(mockTodoDetails, mockNewDate, mockCurrentUser, mockOriginalDate);

    expect(updateDocMocked).toHaveBeenCalledWith(
      mockDocRef,
      {
        [mockOriginalDate]: deleteField(),
      }
    );

    expect(setDocMocked).toHaveBeenCalledWith(
      mockDocRef,
      {
        [mockNewDate]: {
          userTodosOfDay: [
            {
              ...mockTodoDetails,
              originalDate: mockOriginalDate,
              updatedAt: expect.any(Date)
            }
          ]
        },
        userInfo: mockCurrentUser
      },
      { merge: true }
    );
  });

  it('should throw error when trying to move completed todo', async () => {
    const mockTodoDetails = {
      id: 'todo1',
      todo: 'Test Todo',
      isCompleted: true,
    } as TodoItemDetails;
    const mockNewDate = '2023-10-11';
    const mockOriginalDate = '2023-10-10';
    const mockCurrentUser = { accountId: '12345' } as User;

    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({}),
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    getDocMocked.mockResolvedValue(mockDocSnapshot);

    await expect(
      moveTodo(mockTodoDetails, mockNewDate, mockCurrentUser, mockOriginalDate)
    ).rejects.toThrow('Cannot move completed todo');
  });

  it('should throw error when user document does not exist', async () => {
    const mockTodoDetails = {
      id: 'todo1',
      todo: 'Test Todo',
      isCompleted: false,
    } as TodoItemDetails;
    const mockNewDate = '2023-10-11';
    const mockOriginalDate = '2023-10-10';
    const mockCurrentUser = { accountId: '12345' } as User;

    const mockDocSnapshot = {
      exists: () => false,
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    getDocMocked.mockResolvedValue(mockDocSnapshot);

    await expect(
      moveTodo(mockTodoDetails, mockNewDate, mockCurrentUser, mockOriginalDate)
    ).rejects.toThrow('User document does not exist');
  });
});

describe('handleTodoImageUploadAndUpdate()', () => {
  it('should update originalDate when todo has originalDate flag', async () => {
    const mockDocRef = {} as DocumentReference;
    const mockTodoId = 'todo1';
    const mockImageFile = new File([''], 'image.jpg');
    const mockSelectedDate = '10-10-2023';
    const mockUpdatedUserTodos = [
      {
        id: 'todo1',
        todo: 'Test Task',
        imageUrl: '',
        originalDate: '09-10-2023', 
      },
    ] as TodoItemDetails[];
    const mockNewImageUrl = 'http://example.com/new-image.jpg';

    const uploadBytesResumableMock = vi.mocked(uploadBytesResumable);
    const getDownloadURLMock = vi.mocked(getDownloadURL);
    const updateDocMock = vi.mocked(updateDoc);

    uploadBytesResumableMock.mockReturnValue({ snapshot: { ref: {} } } as UploadTask);
    getDownloadURLMock.mockResolvedValue(mockNewImageUrl);

    await handleTodoImageUploadAndUpdate(
      mockDocRef,
      mockTodoId,
      mockImageFile,
      mockSelectedDate,
      mockUpdatedUserTodos,
      '12345'
    );

    expect(updateDocMock).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: {
        userTodosOfDay: [expect.objectContaining({
          imageUrl: mockNewImageUrl,
          originalDate: mockSelectedDate,
        })],
      },
    });
  });

  it('should not update originalDate when todo has no originalDate flag', async () => {
    const mockDocRef = {} as DocumentReference;
    const mockTodoId = 'todo1';
    const mockImageFile = new File([''], 'image.jpg');
    const mockSelectedDate = '10-10-2023';
    const mockUpdatedUserTodos = [
      {
        id: 'todo1',
        todo: 'Test Task',
        imageUrl: '',
      },
    ] as TodoItemDetails[];
    const mockNewImageUrl = 'http://example.com/new-image.jpg';

    const uploadBytesResumableMock = vi.mocked(uploadBytesResumable);
    const getDownloadURLMock = vi.mocked(getDownloadURL);
    const updateDocMock = vi.mocked(updateDoc);

    uploadBytesResumableMock.mockReturnValue({ snapshot: { ref: {} } } as UploadTask);
    getDownloadURLMock.mockResolvedValue(mockNewImageUrl);

    await handleTodoImageUploadAndUpdate(
      mockDocRef,
      mockTodoId,
      mockImageFile,
      mockSelectedDate,
      mockUpdatedUserTodos,
      '12345'
    );

    expect(updateDocMock).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: {
        userTodosOfDay: [expect.not.objectContaining({
          originalDate: expect.any(String),
        })],
      },
    });
  });
});

describe('updateAllRelatedTodos()', () => {
  it('should update todos based on originalTodoId and imageUrl', async () => {
    const mockAccountId = '12345';
    const mockExcludeDate = '2023-10-10';
    const mockOriginalTodoId = 'originalTodo1';
    
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        '2023-10-10': {
          userTodosOfDay: [{
            id: 'originalTodo1',
            todo: 'Original Task',
            imageUrl: 'http://example.com/original.jpg'
          }]
        },
        '2023-10-11': {
          userTodosOfDay: [
            {
              id: 'repeatedTodo1',
              todo: 'Repeated Task',
              originalTodoId: 'originalTodo1',
              imageUrl: 'http://example.com/original.jpg',
              isIndependentEdit: false
            },
            {
              id: 'repeatedTodo2',
              todo: 'Independent Task',
              originalTodoId: 'originalTodo1',
              imageUrl: 'http://example.com/different.jpg',
              isIndependentEdit: true
            },
            {
              id: 'repeatedTodo3',
              todo: 'Using Original Image',
              originalTodoId: 'originalTodo1',
              imageUrl: 'http://example.com/original.jpg',
              isIndependentEdit: true
            }
          ]
        }
      })
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    getDocMocked.mockResolvedValue(mockDocSnapshot);

    const updateFn = (todo: TodoItemDetails) => ({
      ...todo,
      imageUrl: ''
    });

    await updateAllRelatedTodos(
      mockAccountId,
      mockExcludeDate,
      mockOriginalTodoId,
      updateFn
    );

    // Sprawdzamy, czy updateDoc został wywołany z odpowiednimi parametrami
    expect(updateDoc).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        '2023-10-11': {
          userTodosOfDay: expect.arrayContaining([
            expect.objectContaining({
              id: 'repeatedTodo1',
              imageUrl: '' // non-independent todo should be updated
            }),
            expect.objectContaining({
              id: 'repeatedTodo2',
              imageUrl: 'http://example.com/different.jpg' // independent todo with different image should not be updated
            }),
            expect.objectContaining({
              id: 'repeatedTodo3',
              imageUrl: '' // independent todo with original image should be updated
            })
          ])
        }
      })
    );
  });
});

describe('repeatTodo()', () => {
  it('should create repeated todo with isIndependentEdit set to false', async () => {
    const mockTodoDetails = {
      id: 'originalTodo1',
      todo: 'Test Todo',
      imageUrl: 'http://example.com/image.jpg',
    } as TodoItemDetails;
    const mockNewDate = '2023-10-11';
    const mockCurrentUser = { accountId: '12345' } as User;

    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({})
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const setDocMocked = vi.mocked(setDoc);
    getDocMocked.mockResolvedValue(mockDocSnapshot);

    await repeatTodo(mockTodoDetails, mockNewDate, mockCurrentUser);

    expect(setDocMocked).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        [mockNewDate]: {
          userTodosOfDay: [
            expect.objectContaining({
              isIndependentEdit: false,
              originalTodoId: 'originalTodo1',
              originalDate: ''
            })
          ]
        }
      }),
      { merge: true }
    );
  });
});
