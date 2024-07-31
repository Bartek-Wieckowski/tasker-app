import { FILES_FOLDER_todoImages, STARTER_USER_AVATAR_URL, TABLE_NAME_taskerUsers, TABLE_NAME_taskerUserTodos } from '@/lib/constants';
import { auth, provider, storage } from '@/lib/firebase.config';
import { getFirestoreDocRef } from '@/lib/firebaseHelpers';
import {
  isNotValidateGoogleResponse,
  isNotValidateUserAuthOrUsername,
  isNotValidateUserCredentials,
  isNotValidateUserEmailOrPassword,
  isNotValidateUserId,
  isNotValidateUserProfileCredentials,
} from '@/lib/validators';
import { LoginUser, NewUser, UpdateUser, UpdateUserPassword, User, UserProfileUpdates } from '@/types/types';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
  signOut,
  updateProfile,
  signInWithPopup,
  updatePassword,
  updateEmail,
  User as UserFromFirebaseAuth,
} from 'firebase/auth';
import { deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, listAll, ref, uploadBytesResumable } from 'firebase/storage';

export function getAuthenticatedUser() {
  return auth.currentUser;
}

export async function createUserAccount(user: NewUser) {
  if (isNotValidateUserCredentials(user)) {
    throw new Error('Invalid user data: email, password, and username are required');
  }

  try {
    const authUser = await registerUser(user.email, user.password);

    await updateUserProfile(authUser, user.username, STARTER_USER_AVATAR_URL);

    const userToSave = createUserObj(authUser, user.username);

    return await saveUserToFirestoreDatabase(authUser, userToSave);
  } catch (error) {
    throw new Error(`Error creating user account:${error}`);
  }
}

export async function registerUser(email: string, password: string) {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    return res.user;
  } catch (error) {
    throw new Error(`Error registering user: ${error}`);
  }
}

export async function updateUserProfile(userAuth: UserFromFirebaseAuth, username: string, avatarUrl: string) {
  if (isNotValidateUserProfileCredentials(username, avatarUrl)) {
    throw new Error('Invalid username or avatar URL');
  }

  try {
    await updateProfile(userAuth, {
      displayName: username,
      photoURL: avatarUrl,
    });
  } catch (error) {
    throw new Error(`Error updating user profile: ${error}`);
  }
}

export function createUserObj(userAuth: UserFromFirebaseAuth, username?: string) {
  if (isNotValidateUserAuthOrUsername(userAuth, username)) {
    throw new Error('Invalid userAuth data or username');
  }

  return {
    accountId: userAuth.uid,
    imageUrl: userAuth.photoURL || '',
    email: userAuth.email || '',
    username: username || userAuth.displayName || '',
  };
}

export async function saveUserToFirestoreDatabase(userAuth: UserFromFirebaseAuth, user: User) {
  if (isNotValidateUserAuthOrUsername(userAuth, user.username)) {
    throw new Error('Invalid userAuth data or username');
  }

  try {
    const userData = createUserObj(userAuth, user.username);

    const userDocRef = getFirestoreDocRef(TABLE_NAME_taskerUsers, userData.accountId);

    await setDoc(userDocRef, userData);

    return userData;
  } catch (error) {
    throw new Error('Something went wrong');
  }
}

export async function removeUserFromDatabase(userId: string) {
  if (isNotValidateUserId(userId)) {
    throw new Error('Invalid userId');
  }

  try {
    const userDocRef = getFirestoreDocRef(TABLE_NAME_taskerUsers, userId);

    await deleteDoc(userDocRef);
  } catch (error) {
    throw new Error('Something went wrong');
  }
}

export async function loginAccount(user: LoginUser) {
  if (isNotValidateUserEmailOrPassword(user)) {
    throw new Error('Email and password are required.');
  }

  try {
    const userSession = await signInWithEmailAndPassword(auth, user.email, user.password);
    return userSession;
  } catch (error) {
    throw new Error('Login failed. Please check your credentials.');
  }
}

export async function loginAccountWithGoogle() {
  try {
    const userGoogleData = await signInWithGoogle();

    const newUser = createUserObj(userGoogleData);

    await saveUserToFirestoreDatabase(userGoogleData, newUser);
  } catch (error) {
    throw new Error(`Login with Google failed: ${error}`);
  }
}

export async function signInWithGoogle() {
  const res = await signInWithPopup(auth, provider);
  if (isNotValidateGoogleResponse(res)) {
    throw new Error('Sign-in with Google failed. No user data returned.');
  }
  return res.user;
}

export async function logoutAccount() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(`Logout failed: ${error}`);
  }
}

export async function deleteAccount() {
  const currentUser = getAuthenticatedUser();

  if (!currentUser) {
    throw new Error('No current user found');
  }

  try {
    await deleteUserItemsFromDatabase(currentUser.uid);
    await deleteUser(currentUser);
  } catch (error) {
    throw new Error('Something went wrong');
  }
}

export async function deleteUserItemsFromDatabase(userId: string) {
  if (isNotValidateUserId(userId)) {
    throw new Error('Invalid userId');
  }

  try {
    await Promise.all([deleteUserDocuments(userId), deleteUserImages(userId), deleteUserProfileImage(userId), removeUserFromDatabase(userId)]);
  } catch (error) {
    throw new Error(`Failed to delete user items ${error}`);
  }
}

export async function deleteUserDocuments(userId: string) {
  if (isNotValidateUserId(userId)) {
    throw new Error('Invalid userId');
  }

  try {
    const userDocRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, userId);
    await deleteDoc(userDocRef);
  } catch (error) {
    throw new Error(`Error deleting user documents ${error}`);
  }
}

export async function deleteUserImages(userId: string) {
  if (isNotValidateUserId(userId)) {
    throw new Error('Invalid userId');
  }

  try {
    const imagesRef = ref(storage, FILES_FOLDER_todoImages + `/${userId}`);
    const { items } = await listAll(imagesRef);

    const deleteImagePromises = items.map((itemRef) => deleteObject(itemRef));
    await Promise.all(deleteImagePromises);
  } catch (error) {
    throw new Error(`Error deleting user images ${error}`);
  }
}

export async function deleteUserProfileImage(userId: string) {
  if (isNotValidateUserId(userId)) {
    throw new Error('Invalid userId');
  }

  const profileImageRef = ref(storage, `${userId}`);
  try {
    await getDownloadURL(profileImageRef);
    await deleteObject(profileImageRef);
  } catch (error) {
    throw new Error(`Profile image not found: ${error}`);
  }
}

export async function updateUserSettings(user: UpdateUser) {
  const currentUser = getAuthenticatedUser();
  if (!currentUser) {
    throw new Error('No current user found');
  }

  try {
    const updateUser = await prepareUserUpdate(currentUser, user);
    await applyUserProfileUpdate(currentUser, updateUser, user);
    await saveUserToDatabase(currentUser.uid, updateUser);
    await updateUserTodos(currentUser.uid, updateUser);

    return updateUser;
  } catch (error) {
    throw new Error(`Failed to update user settings ${error}`);
  }
}

export async function prepareUserUpdate(currentUser: UserFromFirebaseAuth, user: UpdateUser) {
  const imageUrl = user.imageUrl ? await uploadUserImage(currentUser.uid, user.imageUrl) : currentUser.photoURL || '';

  const preparedUserToUpdate = {
    accountId: currentUser.uid,
    username: user.username,
    email: user.email,
    imageUrl,
  };

  return buildUserToUpdate(preparedUserToUpdate);
}

export async function uploadUserImage(uid: string, imageFile: File) {
  const storageRef = ref(storage, uid);
  const uploadTask = uploadBytesResumable(storageRef, imageFile);
  await uploadTask;
  return getDownloadURL(uploadTask.snapshot.ref);
}

export function buildUserToUpdate({ accountId, username, email, imageUrl }: Omit<User, 'providerId'>) {
  return {
    accountId,
    username,
    email,
    imageUrl,
  };
}

export async function applyUserProfileUpdate(currentUser: UserFromFirebaseAuth, updateUser: User, user: UpdateUser) {
  const profileUpdates: UserProfileUpdates = { displayName: user.username };
  if (user.imageUrl) {
    profileUpdates.photoURL = updateUser.imageUrl;
  }

  try {
    await updateProfile(currentUser, profileUpdates);
    await updateEmail(currentUser, user.email);
  } catch (error) {
    throw new Error(`Failed to update user profile ${error}`);
  }
}

export async function saveUserToDatabase(uid: string, updateUser: User) {
  try {
    const userDocRef = getFirestoreDocRef(TABLE_NAME_taskerUsers, uid);
    await setDoc(userDocRef, updateUser);
  } catch (error) {
    throw new Error(`Failed to save user to database ${error}`);
  }
}

export async function updateUserTodos(uid: string, updateUser: User) {
  try {
    const todosDocRef = getFirestoreDocRef(TABLE_NAME_taskerUserTodos, uid);
    await updateDoc(todosDocRef, { userInfo: updateUser });
  } catch (error) {
    throw new Error(`Failed to update user todos ${error}`);
  }
}

export async function updateUserPassword(user: UpdateUserPassword) {
  const currentUser = getAuthenticatedUser()

  if (!currentUser) throw new Error('No current user found');

  if (user.password) {
    await updatePassword(currentUser, user.password);
  }
}
