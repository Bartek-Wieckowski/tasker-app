import {
  applyUserProfileUpdate,
  buildUserToUpdate,
  createUserObj,
  deleteUserDocuments,
  deleteUserImages,
  deleteUserItemsFromDatabase,
  deleteUserProfileImage,
  loginAccount,
  logoutAccount,
  prepareUserUpdate,
  registerUser,
  removeUserFromDatabase,
  saveUserToDatabase,
  saveUserToFirestoreDatabase,
  signInWithGoogle,
  updateUserProfile,
  updateUserTodos,
  uploadUserImage,
} from '@/api/apiUsers';
import { describe, it, expect, vi } from 'vitest';
import { createUserWithEmailAndPassword, updateProfile, User, signInWithEmailAndPassword, UserCredential, signInWithPopup, signOut } from 'firebase/auth';
import { setDoc, DocumentReference, deleteDoc, updateDoc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { getFirestoreDocRef } from '@/lib/firebaseHelpers';
import { isNotValidateGoogleResponse, isNotValidateUserId } from '@/lib/validators';
import { auth, provider, storage } from '@/lib/firebase.config';
import { deleteObject, getDownloadURL, listAll, ref, StorageReference, uploadBytesResumable } from 'firebase/storage';
import { FILES_FOLDER_todoImages } from '@/lib/constants';
import { UpdateUser, User as UserMyType } from '@/types/types';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(() => ({})),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updatePassword: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
}));
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  listAll: vi.fn(),
  deleteObject: vi.fn(),
  getDownloadURL: vi.fn(),
  uploadBytesResumable: vi.fn(),
}));
vi.mock('@/lib/firebaseHelpers', () => ({
  getFirestoreDocRef: vi.fn(),
}));
vi.mock('@/lib/validators', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    isNotValidateUserId: vi.fn(),
    isNotValidateGoogleResponse: vi.fn(),
  };
});
describe('registerUser()', () => {
  it('should register a user when provided with valid email and password', async () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';

    const mockcreateUserWithEmailAndPassword = vi.fn().mockResolvedValue({
      user: { uid: '12345', email: mockEmail, password: 'password123' },
    });
    vi.mocked(createUserWithEmailAndPassword).mockImplementation(mockcreateUserWithEmailAndPassword);

    const user = await registerUser(mockEmail, mockPassword);

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), mockEmail, mockPassword);
    expect(user).toEqual({ uid: '12345', email: mockEmail, password: mockPassword });
  });
});

describe('updateUserProfile()', () => {
  it('should update user profile with valid username and avatar URL', async () => {
    const mockUserAuth = { uid: '12345', displayName: '', photoURL: '' } as User;
    const username = 'testuser';
    const avatarUrl = 'http://example.com/avatar.jpg';

    const mockUpdateProfile = vi.fn().mockResolvedValue(null);
    vi.mocked(updateProfile).mockImplementation(mockUpdateProfile);

    await updateUserProfile(mockUserAuth, username, avatarUrl);

    expect(mockUpdateProfile).toHaveBeenCalledWith(mockUserAuth, {
      displayName: username,
      photoURL: avatarUrl,
    });

    expect(mockUpdateProfile).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if username is empty', async () => {
    const mockUserAuth = { uid: '12345', displayName: '', photoURL: '' } as User;
    const emptyUsername = '';
    const avatarUrl = 'http://example.com/avatar.jpg';

    const mockUpdateProfile = vi.fn().mockResolvedValue(null);
    vi.mocked(updateProfile).mockImplementation(mockUpdateProfile);

    await expect(updateUserProfile(mockUserAuth, emptyUsername, avatarUrl)).rejects.toThrow('Invalid username or avatar URL');
  });

  it('should throw an error if updating profile fails', async () => {
    const mockUserAuth = { uid: '12345', displayName: '', photoURL: '' } as User;
    const username = 'newUsername';
    const avatarUrl = 'http://example.com/avatar.jpg';

    const mockUpdateProfile = vi.fn().mockRejectedValue(new Error('Update failed'));
    vi.mocked(updateProfile).mockImplementation(mockUpdateProfile);

    await expect(updateUserProfile(mockUserAuth, username, avatarUrl)).rejects.toThrow('Error updating user profile: Error: Update failed');
  });
});

describe('createUserObj()', () => {
  it('should create user object with all provided properties', () => {
    const userAuth = {
      uid: '123',
      photoURL: 'http://example.com/photo.jpg',
      email: 'user@example.com',
      displayName: 'User',
    } as User;
    const username = 'customUsername';

    const result = createUserObj(userAuth, username);

    expect(result).toEqual({
      accountId: '123',
      imageUrl: 'http://example.com/photo.jpg',
      email: 'user@example.com',
      username: 'customUsername',
    });
  });

  it('should throw an error if userAuth is invalid', () => {
    const userAuth = {
      uid: '',
      email: 'user@example.com',
    } as User;

    expect(() => createUserObj(userAuth)).toThrow('Invalid userAuth data or username');
  });

  it('should throw an error if username is not provided and displayName is empty', () => {
    const userAuth = {
      uid: '123',
      email: 'user@example.com',
      displayName: '',
    } as User;

    expect(() => createUserObj(userAuth, '')).toThrow('Invalid userAuth data or username');
  });
});

describe('saveUserToFirestoreDatabase()', () => {
  it('should save valid user data to Firestore when userAuth and user data are valid', async () => {
    const mockUserAuth = { uid: '123', email: 'test@example.com', photoURL: 'http://example.com/photo.jpg' } as User;
    const mockUser = { accountId: '123', username: 'testuser', email: 'test@example.com', imageUrl: 'http://example.com/photo.jpg' };

    const mockUserDocRef = {} as DocumentReference;
    const setDocMock = vi.mocked(setDoc).mockResolvedValue(undefined);
    const getFirestoreDocRefMock = vi.mocked(getFirestoreDocRef).mockReturnValue(mockUserDocRef);

    const result = await saveUserToFirestoreDatabase(mockUserAuth, mockUser);

    expect(result).toEqual({
      accountId: '123',
      imageUrl: 'http://example.com/photo.jpg',
      email: 'test@example.com',
      username: 'testuser',
    });
    expect(getFirestoreDocRefMock).toHaveBeenCalledWith('taskerUsers', '123');
    expect(setDocMock).toHaveBeenCalledWith(mockUserDocRef, {
      accountId: '123',
      imageUrl: 'http://example.com/photo.jpg',
      email: 'test@example.com',
      username: 'testuser',
    });
  });

  it('should throw error when userAuth data is invalid', async () => {
    const mockInvalidUserAuth = { uid: '', email: '', photoURL: '' } as User;
    const mockUser = { accountId: '123', username: 'testuser', email: 'test@example.com', imageUrl: 'http://example.com/photo.jpg' };

    await expect(saveUserToFirestoreDatabase(mockInvalidUserAuth, mockUser)).rejects.toThrow('Invalid userAuth data or username');
  });
});

describe('removeUserFromDatabase()', () => {
  it('should delete user document when userId is valid', async () => {
    const userId = '12345';
    vi.mocked(isNotValidateUserId).mockReturnValue(false);
    const mockUserDocRef = { id: userId } as DocumentReference;
    vi.mocked(getFirestoreDocRef).mockReturnValue(mockUserDocRef);
    const mockDeleteDoc = vi.mocked(deleteDoc).mockResolvedValueOnce(undefined);

    await expect(removeUserFromDatabase(userId)).resolves.toBeUndefined();
    expect(getFirestoreDocRef).toHaveBeenCalledWith('taskerUsers', userId);
    expect(mockDeleteDoc).toHaveBeenCalledWith(mockUserDocRef);
  });

  it('should throw an error when userId is an empty string', async () => {
    const userId = '';

    const mockIsNotValidateUserId = vi.mocked(isNotValidateUserId).mockReturnValue(true);

    await expect(removeUserFromDatabase(userId)).rejects.toThrow('Invalid userId');
    expect(mockIsNotValidateUserId).toHaveBeenCalledWith(userId);
  });
});
describe('loginAccount()', () => {
  it('should return user session when email and password are valid', async () => {
    const user = { email: 'test@example.com', password: 'password123' };
    const userSession = { user: { uid: '12345' } } as UserCredential;

    const mockSignInWithEmailAndPassword = vi.mocked(signInWithEmailAndPassword).mockResolvedValue(userSession);

    const result = await loginAccount(user);

    expect(result).toEqual(userSession);
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(auth, user.email, user.password);
  });

  it('should throw an error when userId is an empty string', async () => {
    const userId = '';

    const mockIsNotValidateUserId = vi.mocked(isNotValidateUserId).mockReturnValue(true);

    await expect(removeUserFromDatabase(userId)).rejects.toThrow('Invalid userId');
    expect(mockIsNotValidateUserId).toHaveBeenCalledWith(userId);
  });
});

describe('signInWithGoogle()', () => {
  it('should return user data when sign-in is successful', async () => {
    const mockUser = { uid: '12345' } as User;
    const mockUserCredential = { user: mockUser } as UserCredential;
    vi.mocked(signInWithPopup).mockResolvedValue(mockUserCredential);
    vi.mocked(isNotValidateGoogleResponse).mockReturnValue(false);

    const result = await signInWithGoogle();

    expect(result).toEqual(mockUser);
    expect(signInWithPopup).toHaveBeenCalledWith(auth, provider);
    expect(isNotValidateGoogleResponse).toHaveBeenCalledWith(mockUserCredential);
  });

  it('should throw an error when sign-in response is invalid', async () => {
    const validUserCredential = { user: { uid: '12345' } } as UserCredential;
    vi.mocked(signInWithPopup).mockResolvedValueOnce(validUserCredential);

    vi.mocked(isNotValidateGoogleResponse).mockReturnValueOnce(false);

    await expect(signInWithGoogle()).resolves.toEqual(validUserCredential.user);
  });
});

describe('logoutAccount()', () => {
  it('should log out the user successfully when signOut resolves', async () => {
    vi.mocked(signOut).mockResolvedValue(undefined);

    await expect(logoutAccount()).resolves.toBeUndefined();

    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it('should throw an error when signOut rejects', async () => {
    const errorMessage = 'Network error';
    vi.mocked(signOut).mockRejectedValue(new Error(errorMessage));

    await expect(logoutAccount()).rejects.toThrow(`Logout failed: Error: ${errorMessage}`);

    expect(signOut).toHaveBeenCalledWith(auth);
  });
});

describe('deleteUserItemsFromDatabase()', () => {
  const invalidUserId = '';
  it('should throw an error when userId is invalid', async () => {
    const isNotValidateUserIdMock = vi.mocked(isNotValidateUserId);
    isNotValidateUserIdMock.mockReturnValue(true);

    await expect(deleteUserItemsFromDatabase(invalidUserId)).rejects.toThrow('Invalid userId');
  });
});

describe('deleteUserDocuments()', () => {
  const validUserId = '12345';
  
  it('should delete documents when valid userId is provided and document exists', async () => {
    const mockDocRef = { id: validUserId } as DocumentReference;
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({}),
      id: validUserId,
      ref: mockDocRef,
      metadata: { hasPendingWrites: false, fromCache: false }
    } as DocumentSnapshot;

    const getFirestoreDocRefMock = vi.mocked(getFirestoreDocRef);
    const deleteDocMock = vi.mocked(deleteDoc);
    const getDocMock = vi.mocked(getDoc);
    const isNotValidateUserIdMock = vi.mocked(isNotValidateUserId);

    isNotValidateUserIdMock.mockReturnValue(false);
    getFirestoreDocRefMock.mockReturnValue(mockDocRef);
    getDocMock.mockResolvedValue(mockDocSnapshot);
    deleteDocMock.mockResolvedValue();

    await deleteUserDocuments(validUserId);

    expect(getFirestoreDocRefMock).toHaveBeenCalledWith('taskerUserTodos', validUserId);
    expect(getDocMock).toHaveBeenCalledWith(mockDocRef);
    expect(deleteDocMock).toHaveBeenCalledWith(mockDocRef);
  });

  it('should not delete documents when document does not exist', async () => {
    const mockDocRef = { id: validUserId } as DocumentReference;
    const mockDocSnapshot = {
      exists: () => false,
      data: () => ({}),
      id: validUserId,
      ref: mockDocRef,
      metadata: { hasPendingWrites: false, fromCache: false }
    } as DocumentSnapshot;

    const getFirestoreDocRefMock = vi.mocked(getFirestoreDocRef);
    const deleteDocMock = vi.mocked(deleteDoc);
    const getDocMock = vi.mocked(getDoc);
    const isNotValidateUserIdMock = vi.mocked(isNotValidateUserId);

    isNotValidateUserIdMock.mockReturnValue(false);
    getFirestoreDocRefMock.mockReturnValue(mockDocRef);
    getDocMock.mockResolvedValue(mockDocSnapshot);

    await deleteUserDocuments(validUserId);

    expect(getDocMock).toHaveBeenCalledWith(mockDocRef);
    expect(deleteDocMock).not.toHaveBeenCalled();
  });

  it('should throw an error if deleteDoc fails', async () => {
    const mockDocRef = { id: validUserId } as DocumentReference;
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({}),
      id: validUserId,
      ref: mockDocRef,
      metadata: { hasPendingWrites: false, fromCache: false }
    } as DocumentSnapshot;

    const getFirestoreDocRefMock = vi.mocked(getFirestoreDocRef);
    const deleteDocMock = vi.mocked(deleteDoc);
    const getDocMock = vi.mocked(getDoc);
    const isNotValidateUserIdMock = vi.mocked(isNotValidateUserId);

    isNotValidateUserIdMock.mockReturnValue(false);
    getFirestoreDocRefMock.mockReturnValue(mockDocRef);
    getDocMock.mockResolvedValue(mockDocSnapshot);
    deleteDocMock.mockRejectedValue(new Error('Deletion failed'));

    await expect(deleteUserDocuments(validUserId))
      .rejects
      .toThrow('Error deleting user documents: Error: Deletion failed');
  });
});

describe('deleteUserImages()', () => {
  const validUserId = '12345';
  const imagesRefMock = { fullPath: `files/${validUserId}` } as StorageReference;

  it('should delete all user images when valid userId is provided', async () => {
    const isNotValidateUserIdMock = vi.mocked(isNotValidateUserId);
    const refMock = vi.mocked(ref);
    const listAllMock = vi.mocked(listAll);
    const deleteObjectMock = vi.mocked(deleteObject);

    isNotValidateUserIdMock.mockReturnValue(false);
    refMock.mockReturnValue(imagesRefMock);
    listAllMock.mockResolvedValue({ items: [{ fullPath: 'file1' } as StorageReference, { fullPath: 'file2' } as StorageReference], prefixes: [] });
    deleteObjectMock.mockResolvedValue();

    await deleteUserImages(validUserId);

    expect(refMock).toHaveBeenCalledWith(storage, FILES_FOLDER_todoImages + `/${validUserId}`);
    expect(listAllMock).toHaveBeenCalledWith(imagesRefMock);
    expect(deleteObjectMock).toHaveBeenCalledTimes(2);
    expect(deleteObjectMock).toHaveBeenCalledWith({ fullPath: 'file1' });
    expect(deleteObjectMock).toHaveBeenCalledWith({ fullPath: 'file2' });
  });

  it('should throw an error if listAll fails', async () => {
    const isNotValidateUserIdMock = vi.mocked(isNotValidateUserId);
    const refMock = vi.mocked(ref);
    const listAllMock = vi.mocked(listAll);

    isNotValidateUserIdMock.mockReturnValue(false);
    refMock.mockReturnValue(imagesRefMock);
    listAllMock.mockRejectedValue(new Error('List all failed'));

    await expect(deleteUserImages(validUserId)).rejects.toThrow('Error deleting user images Error: List all failed');
  });

  it('should throw an error if deleteObject fails', async () => {
    const isNotValidateUserIdMock = vi.mocked(isNotValidateUserId);
    const refMock = vi.mocked(ref);
    const listAllMock = vi.mocked(listAll);
    const deleteObjectMock = vi.mocked(deleteObject);

    isNotValidateUserIdMock.mockReturnValue(false);
    refMock.mockReturnValue(imagesRefMock);
    listAllMock.mockResolvedValue({ items: [{ fullPath: 'file1' } as StorageReference, { fullPath: 'file2' } as StorageReference], prefixes: [] });
    deleteObjectMock.mockRejectedValue(new Error('Delete object failed'));

    await expect(deleteUserImages(validUserId)).rejects.toThrow('Error deleting user images Error: Delete object failed');
  });
});

describe('deleteUserProfileImage()', () => {
  const validUserId = '12345';

  it('should delete the profile image when valid userId is provided', async () => {
    const isNotValidateUserIdMock = vi.mocked(isNotValidateUserId);
    const refMock = vi.mocked(ref);
    const getDownloadURLMock = vi.mocked(getDownloadURL);
    const deleteObjectMock = vi.mocked(deleteObject);

    isNotValidateUserIdMock.mockReturnValue(false);
    refMock.mockReturnValue({} as StorageReference);
    getDownloadURLMock.mockResolvedValue('some-url');
    deleteObjectMock.mockResolvedValue();

    await deleteUserProfileImage(validUserId);

    expect(refMock).toHaveBeenCalledWith(storage, `${validUserId}`);
    expect(getDownloadURLMock).toHaveBeenCalledWith({});
    expect(deleteObjectMock).toHaveBeenCalledWith({});
  });

  it('should throw an error if getDownloadURL fails', async () => {
    const isNotValidateUserIdMock = vi.mocked(isNotValidateUserId);
    const refMock = vi.mocked(ref);
    const getDownloadURLMock = vi.mocked(getDownloadURL);

    isNotValidateUserIdMock.mockReturnValue(false);
    refMock.mockReturnValue({} as StorageReference);
    getDownloadURLMock.mockRejectedValue(new Error('Get URL failed'));

    await expect(deleteUserProfileImage(validUserId)).rejects.toThrow('Profile image not found: Error: Get URL failed');
  });

  it('should throw an error if deleteObject fails', async () => {
    const isNotValidateUserIdMock = vi.mocked(isNotValidateUserId);
    const refMock = vi.mocked(ref);
    const getDownloadURLMock = vi.mocked(getDownloadURL);
    const deleteObjectMock = vi.mocked(deleteObject);

    isNotValidateUserIdMock.mockReturnValue(false);
    refMock.mockReturnValue({} as StorageReference);
    getDownloadURLMock.mockResolvedValue('some-url');
    deleteObjectMock.mockRejectedValue(new Error('Delete object failed'));

    await expect(deleteUserProfileImage(validUserId)).rejects.toThrow('Profile image not found: Error: Delete object failed');
  });
});

describe('prepareUserUpdate()', () => {
  it('prepares user update successfully', async () => {
    const mockCurrentUser = { uid: '123', photoURL: 'old-url' } as User;
    const mockUpdateUser = { username: 'newuser', email: 'newuser@example.com', imageUrl: null } as unknown as UpdateUser;

    const result = await prepareUserUpdate(mockCurrentUser, mockUpdateUser);

    expect(result).toEqual({
      accountId: '123',
      username: 'newuser',
      email: 'newuser@example.com',
      imageUrl: 'old-url',
    });
  });
});

describe('uploadUserImage()', () => {
  it('throws an error if upload fails', async () => {
    const mockUid = '123';
    const mockFile = new File([], 'image.png');

    const uploadBytesResumableMock = vi.mocked(uploadBytesResumable);

    uploadBytesResumableMock.mockRejectedValue(new Error('Upload failed'));

    await expect(uploadUserImage(mockUid, mockFile)).rejects.toThrow('Upload failed');
  });
});

describe('buildUserToUpdate()', () => {
  it('builds user to update object correctly', () => {
    const userUpdatedObj = {
      accountId: '123',
      username: 'newuser',
      email: 'newuser@example.com',
      imageUrl: 'https://example.com/image.png',
    };

    const result = buildUserToUpdate(userUpdatedObj);

    expect(result).toEqual(userUpdatedObj);
  });
});

describe('applyUserProfileUpdate()', () => {
  it('throws an error if profile update fails', async () => {
    const mockCurrentUser = { uid: '123' } as User;
    const mockUpdateUser = { username: 'newuser' } as UserMyType;
    const mockUser = { username: 'newuser', email: 'newuser@example.com', imageUrl: null } as unknown as UpdateUser;

    const updateProfileMock = vi.mocked(updateProfile);

    updateProfileMock.mockRejectedValue(new Error('Profile update failed'));

    await expect(applyUserProfileUpdate(mockCurrentUser, mockUpdateUser, mockUser)).rejects.toThrow('Failed to update user profile Error: Profile update failed');
  });
});

describe('saveUserToDatabase()', () => {
  it('saves user to database successfully', async () => {
    const mockUid = '123';
    const mockUpdateUser = { username: 'newuser', email: 'newuser@example.com' } as unknown as UserMyType;
    const mockDocRef = {} as DocumentReference;

    const getFirestoreDocRefMock = vi.mocked(getFirestoreDocRef);
    getFirestoreDocRefMock.mockReturnValue(mockDocRef);

    await saveUserToDatabase(mockUid, mockUpdateUser);

    expect(getFirestoreDocRef).toHaveBeenCalledWith('taskerUsers', mockUid);
    expect(setDoc).toHaveBeenCalledWith(mockDocRef, mockUpdateUser);
  });
});

describe('updateUserTodos()', () => {
  const mockUid = '123';
  const mockUpdateUser = { username: 'newuser', email: 'newuser@example.com' } as unknown as UserMyType;
  
  it('should update todos when document exists', async () => {
    const mockDocRef = {} as DocumentReference;
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({}),
      id: mockUid,
      ref: mockDocRef,
      metadata: { hasPendingWrites: false, fromCache: false }
    } as DocumentSnapshot;

    const getFirestoreDocRefMock = vi.mocked(getFirestoreDocRef);
    const updateDocMock = vi.mocked(updateDoc);
    const getDocMock = vi.mocked(getDoc);

    getFirestoreDocRefMock.mockReturnValue(mockDocRef);
    getDocMock.mockResolvedValue(mockDocSnapshot);
    updateDocMock.mockResolvedValue();

    await updateUserTodos(mockUid, mockUpdateUser);

    expect(getDocMock).toHaveBeenCalledWith(mockDocRef);
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { userInfo: mockUpdateUser });
  });

  it('should not update todos when document does not exist', async () => {
    const mockDocRef = {} as DocumentReference;
    const mockDocSnapshot = {
      exists: () => false,
      data: () => ({}),
      id: mockUid,
      ref: mockDocRef,
      metadata: { hasPendingWrites: false, fromCache: false }
    } as DocumentSnapshot;

    const getFirestoreDocRefMock = vi.mocked(getFirestoreDocRef);
    const updateDocMock = vi.mocked(updateDoc);
    const getDocMock = vi.mocked(getDoc);

    getFirestoreDocRefMock.mockReturnValue(mockDocRef);
    getDocMock.mockResolvedValue(mockDocSnapshot);

    await updateUserTodos(mockUid, mockUpdateUser);

    expect(getDocMock).toHaveBeenCalledWith(mockDocRef);
    expect(updateDocMock).not.toHaveBeenCalled();
  });

  it('throws an error if updating todos fails', async () => {
    const mockUid = '123';
    const mockUpdateUser = { username: 'newuser', email: 'newuser@example.com' } as unknown as UserMyType;
    const mockDocRef = {} as DocumentReference;
    const mockDocSnapshot = {
      exists: () => true,
      data: () => ({}),
      id: mockUid,
      ref: mockDocRef,
      metadata: { hasPendingWrites: false, fromCache: false }
    } as DocumentSnapshot;

    const getFirestoreDocRefMock = vi.mocked(getFirestoreDocRef);
    const updateDocMock = vi.mocked(updateDoc);
    const getDocMock = vi.mocked(getDoc);

    getFirestoreDocRefMock.mockReturnValue(mockDocRef);
    getDocMock.mockResolvedValue(mockDocSnapshot);
    updateDocMock.mockRejectedValue(new Error('Update failed'));

    await expect(updateUserTodos(mockUid, mockUpdateUser))
      .rejects
      .toThrow('Failed to update user todos Error: Update failed');
  });
});
