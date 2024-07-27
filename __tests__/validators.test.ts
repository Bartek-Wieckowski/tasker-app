import { it, expect, describe } from 'vitest';
import { isNotValidateUserAuthOrUsername, isNotValidateUserCredentials, isNotValidateUserProfileCredentials } from '@/lib/validators';
import { User as UserFromFirebaseAuth } from 'firebase/auth';

describe('isNotValidateUserCredentials()', () => {
  it('should return true when user has all fields empty', () => {
    const user = { username: '', email: '', password: '' };
    const result = isNotValidateUserCredentials(user);
    expect(result).toBe(true);
  });
  it('should return true when email is empty', () => {
    const user = { username: 'testuser', email: '', password: 'password123' };
    const result = isNotValidateUserCredentials(user);
    expect(result).toBe(true);
  });
  it('should return false when all fields are filled', () => {
    const user = { username: 'testuser', email: 'test@example.com', password: 'password123' };
    const result = isNotValidateUserCredentials(user);
    expect(result).toBe(false);
  });
});

describe('isNotValidateUserProfileCredentials()', () => {
  it('should return true when username is empty', () => {
    const result = isNotValidateUserProfileCredentials('', 'http://example.com/avatar.png');
    expect(result).toBe(true);
  });

  it('should return true when username is only whitespace', () => {
    const result = isNotValidateUserProfileCredentials('   ', 'http://example.com/avatar.png');
    expect(result).toBe(true);
  });

  it('should return false when all fields are filled', () => {
    const result = isNotValidateUserProfileCredentials('JohnDoe', 'http://example.com/avatar.png');
    expect(result).toBe(false);
  });
});

describe('isNotValidateUserAuthOrUsername()', () => {
  const mockUserAuth = {
    uid: '123',
    email: 'user@example.com',
  } as UserFromFirebaseAuth;
  it('should return true if uid is missing', () => {
    const specificUserAuth = {
      uid: '',
      email: 'user@example.com',
    } as UserFromFirebaseAuth;

    expect(isNotValidateUserAuthOrUsername(specificUserAuth)).toBe(true);
  });

  it('should return true if email is null', () => {
    const specificUserAuth = {
      uid: '123',
      email: null,
    } as UserFromFirebaseAuth;

    expect(isNotValidateUserAuthOrUsername(specificUserAuth)).toBe(true);
  });

  it('should return true if username is provided and is empty after trimming', () => {
    expect(isNotValidateUserAuthOrUsername(mockUserAuth, '  ')).toBe(true);
  });

  it('should return false if all required fields are valid and username is not provided', () => {
    expect(isNotValidateUserAuthOrUsername(mockUserAuth)).toBe(false);
  });

  it('should return false if all required fields are valid and username is valid', () => {
    expect(isNotValidateUserAuthOrUsername(mockUserAuth, 'validUsername')).toBe(false);
  });
});
