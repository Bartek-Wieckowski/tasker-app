import { STARTER_USER_AVATAR_URL } from '@/lib/constants';
import { auth, db, provider, storage } from '@/lib/firebase.config';
import { LoginUser, NewUser, UpdateUser, UpdateUserPassword, User } from '@/types/types';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
  signOut,
  updateProfile,
  UserCredential,
  signInWithPopup,
  updatePassword,
  updateEmail,
} from 'firebase/auth';
import { deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, listAll, ref, uploadBytesResumable } from 'firebase/storage';

export async function createUserAccount(user: NewUser): Promise<User> {
  const res = await createUserWithEmailAndPassword(auth, user.email, user.password);
  const userData = res.user;

  await updateProfile(res.user, {
    displayName: user.username,
    photoURL: STARTER_USER_AVATAR_URL,
  });

  const newUser = await saveUserToDB({
    accountId: userData.uid,
    email: user.email,
    username: user.username,
    imageUrl: userData.photoURL!,
  });

  return newUser;
}

export async function saveUserToDB(user: { accountId: string; email: string; username: string; imageUrl: string }): Promise<User> {
  try {
    const userData = {
      accountId: user.accountId,
      email: user.email,
      username: user.username,
      imageUrl: user.imageUrl,
    };

    await setDoc(doc(db, 'taskerUsers', user.accountId), userData);

    return userData;
  } catch (error) {
    throw new Error('Something went wrong');
  }
}

export async function removeUserToDB(userId: string) {
  try {
    const res = await deleteDoc(doc(db, 'taskerUsers', userId));

    return res;
  } catch (error) {
    throw new Error('Something went wrong');
  }
}

export async function loginAccount(user: LoginUser): Promise<UserCredential> {
  const userSession = await signInWithEmailAndPassword(auth, user.email, user.password);
  return userSession;
}

export async function loginAccountWithGoogle(): Promise<User | null> {
  const res = await signInWithPopup(auth, provider);

  if (!res || !res.user) {
    throw new Error('Sign-in with Google failed. No user data returned.');
  }

  const userGoogleData = res.user;

  if (userGoogleData) {
    const newUser = await saveUserToDB({
      accountId: userGoogleData.uid,
      email: userGoogleData.email!,
      username: userGoogleData.displayName!,
      imageUrl: userGoogleData.photoURL!,
    });

    return newUser;
  } else {
    return null;
  }
}

export async function logoutAccount() {
  const res = await signOut(auth);
  return res;
}

export async function deleteAccount() {
  const currentUser = auth.currentUser;

  if (currentUser) {
    try {
      const storageRef = ref(storage, `${currentUser.uid}`);
      const storageSnapshot = await getDownloadURL(storageRef).catch(() => null);

      const allCurrentUserDocRef = doc(db, 'taskerUserTodos', currentUser.uid);
      await deleteDoc(allCurrentUserDocRef);

      const allCurrentUserImagesRef = ref(storage, `todoImages/${currentUser.uid}`);
      const { items } = await listAll(allCurrentUserImagesRef);

      const deleteAllImages = items.map((itemRef) => deleteObject(itemRef));
      await Promise.all(deleteAllImages);

      if (storageSnapshot) {
        await deleteObject(storageRef);
      }

      await removeUserToDB(currentUser.uid);
      await deleteUser(currentUser);
    } catch (error) {
      throw new Error('Something went wrong');
    }
  }
}

export async function updateUserSettings(user: UpdateUser): Promise<User> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Something went wrong');

  if (user.imageUrl) {
    const storageRef = ref(storage, currentUser.uid);
    const uploadTask = uploadBytesResumable(storageRef, user.imageUrl);

    await uploadTask;

    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    const updateUser: User = {
      accountId: currentUser.uid,
      username: user.username,
      email: user.email,
      imageUrl: downloadURL,
    };

    await updateProfile(currentUser, {
      displayName: user.username,
      photoURL: downloadURL,
    });

    await updateEmail(currentUser, user.email);

    await setDoc(doc(db, 'taskerUsers', currentUser.uid), updateUser);

    return updateUser;
  } else {
    const updateUser: User = {
      accountId: currentUser.uid,
      username: user.username,
      email: user.email,
      imageUrl: currentUser.photoURL || '',
    };

    await updateProfile(currentUser, {
      displayName: user.username,
    });

    await updateEmail(currentUser, user.email);

    await setDoc(doc(db, 'taskerUsers', currentUser.uid), updateUser);

    const docRef = doc(db, 'taskerUserTodos', currentUser.uid);
    await updateDoc(docRef, {
      userInfo: updateUser,
    });

    return updateUser;
  }
}

export async function updateUserPassword(user: UpdateUserPassword) {
  const currentUser = auth.currentUser;

  if (!currentUser) throw new Error('Something went wrong');

  if (user.password) {
    await updatePassword(currentUser, user.password);
  }
}
