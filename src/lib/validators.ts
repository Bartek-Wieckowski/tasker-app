import { NewUser } from '@/types/types';
import { User as UserFromFirebaseAuth } from 'firebase/auth';

export function isNotValidateUserCredentials(user: NewUser) {
  return !user.email || !user.password || !user.username;
}

export function isNotValidateUserProfileCredentials(username: string, avatarUrl: string) {
  return !username.trim() || !avatarUrl.trim();
}
export function isNotValidateUserAuthOrUsername(userAuth: UserFromFirebaseAuth, username?: string) {
  return !userAuth.uid || !userAuth.email || (username !== undefined && username.trim().length === 0);
}
