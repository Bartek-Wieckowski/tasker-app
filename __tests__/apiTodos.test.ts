import { createTodoItem, getTodoById, getTodosForDate, getTodosFromDay, getUserTodosDocSnapshot, updateOrCreateTodos, uploadImageAndGetUrl } from '@/api/apiTodos';
import { FILES_FOLDER_todoImages, TABLE_NAME_taskerUserTodos } from '@/lib/constants';
import { storage } from '@/lib/firebase.config';
import { getFirestoreDocRef } from '@/lib/firebaseHelpers';
import { TodoItemBase, User } from '@/types/types';
import { DocumentSnapshot, DocumentReference, getDoc, DocumentData, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, StorageReference, uploadBytesResumable, UploadTask } from 'firebase/storage';
import { it, expect, describe, vi } from 'vitest';

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
}));
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
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
  it('should return todos for a given date when data exists', () => {
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        '2023-10-10': {
          userTodosOfDay: [{ id: 1, task: 'Test Task' }],
        },
      }),
    } as unknown as DocumentSnapshot;

    const result = getTodosForDate('2023-10-10', mockDocSnapshot);
    expect(result).toEqual([{ id: 1, task: 'Test Task' }]);
  });

  it('should return an empty array when there are no todos for the given date', () => {
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        '2023-10-10': {
          userTodosOfDay: [],
        },
      }),
    } as unknown as DocumentSnapshot;

    const result = getTodosForDate('2023-10-10', mockDocSnapshot);
    expect(result).toEqual([]);
  });
});

describe('getTodoById()', () => {
  it('should retrieve the correct todo item by ID for a given date and user', async () => {
    const mockUser = { accountId: '12345' } as User;
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({
        '2023-10-10': {
          userTodosOfDay: [
            { id: 'todo1', todo: 'Test Todo 1', isCompleted: false, createdAt: new Date(), updatedAt: new Date() },
            { id: 'todo2', todo: 'Test Todo 2', isCompleted: true, createdAt: new Date(), updatedAt: new Date() },
          ],
        },
      }),
    } as unknown as DocumentSnapshot;

    const getDocMocked = vi.mocked(getDoc);
    const getFirestoreDocRefMocked = vi.mocked(getFirestoreDocRef);

    getDocMocked.mockResolvedValue(mockDocSnapshot);
    getFirestoreDocRefMocked.mockReturnValue({} as DocumentReference);

    const result = await getTodoById('todo1', '2023-10-10', mockUser);

    expect(result).toEqual({ id: 'todo1', todo: 'Test Todo 1', isCompleted: false, createdAt: new Date(), updatedAt: new Date() });
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
    const mockDocRef = {} as DocumentReference;
    const mockSelectedDate = '2023-10-10';
    const mockTodoItem = { id: '1', task: 'Test Task' } as unknown as TodoItemBase;
    const mockUserData = {
      [mockSelectedDate]: {
        userTodosOfDay: [{ id: '0', task: 'Existing Task' }],
      },
    } as DocumentData;

    const updateDocMocked = vi.mocked(updateDoc);

    await updateOrCreateTodos(mockDocRef, mockSelectedDate, mockTodoItem, mockUserData);

    expect(updateDocMocked).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: {
        userTodosOfDay: [...mockUserData[mockSelectedDate].userTodosOfDay, mockTodoItem],
      },
    });
  });

  it('should create new todos for the given date if no todos exist', async () => {
    const mockDocRef = {} as DocumentReference;
    const mockSelectedDate = '2023-10-10';
    const mockTodoItem = { id: '1', task: 'Test Task' } as unknown as TodoItemBase;
    const mockUserData = {} as DocumentData;

    const updateDocMocked = vi.mocked(updateDoc);

    await updateOrCreateTodos(mockDocRef, mockSelectedDate, mockTodoItem, mockUserData);

    expect(updateDocMocked).toHaveBeenCalledWith(mockDocRef, {
      [mockSelectedDate]: {
        userTodosOfDay: [mockTodoItem],
      },
    });
  });
});
