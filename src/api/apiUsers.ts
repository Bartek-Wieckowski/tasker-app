import { STARTER_USER_AVATAR_URL } from '@/lib/constants';
import { auth, db, provider } from '@/lib/firebase.config';
import { LoginUser, NewUser, User } from '@/types/types';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser, signOut, updateProfile, UserCredential, signInWithPopup } from 'firebase/auth';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';

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

    await setDoc(doc(db, 'userTasker', user.accountId), userData);

    return userData;
  } catch (error) {
    throw new Error('Something went wrong');
  }
}

export async function removeUserToDB(userId: string) {
  try {
    const res = await deleteDoc(doc(db, 'userTasker', userId));

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
  try {
    const res = await signOut(auth);
    return res;
  } catch (error) {
    throw new Error('Something went wrong');
  }
}

export async function deleteAccount() {
  try {
    const currentUser = auth.currentUser;

    if (currentUser) {
      await removeUserToDB(currentUser.uid);
      await deleteUser(currentUser);
    }
  } catch (error) {
    throw new Error('Something went wrong');
  }
}
