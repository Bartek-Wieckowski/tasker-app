import { doc } from 'firebase/firestore';
import { db } from './firebase.config';

export function getFirestoreDocRef(collectionName: string, uid: string) {
  return doc(db, collectionName, uid);
}
