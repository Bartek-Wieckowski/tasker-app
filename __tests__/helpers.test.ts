import { dateCustomFormatting, isNotValidateUserCredentials, isNotValidateUserProfileCredentials } from '@/lib/helpers';
import { it, expect, describe } from 'vitest';

describe('dateCustomFormatting()', () => {
  it('should format a date object to "dd-mm-yyyy" format', () => {
    const date = new Date(2023, 4, 15);
    const formattedDate = dateCustomFormatting(date);
    expect(formattedDate).toBe('15-05-2023');
  });
});

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
