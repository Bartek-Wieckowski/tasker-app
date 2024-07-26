import { NewUser } from '@/types/types';

export function dateCustomFormatting(date: Date): string {
  const padStart = (value: number): string => value.toString().padStart(2, '0');
  return `${padStart(date.getDate())}-${padStart(date.getMonth() + 1)}-${date.getFullYear()}`;
}

export function formatDateString(dateString: string | Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-US', options);

  const time = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${formattedDate} at ${time}`;
}

export const multiFormatDateString = (timestamp: Date | { seconds: number; nanoseconds: number } = new Date()): string => {
  const date: Date = convertTimestampToDate(timestamp);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = Math.abs(diff) / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;
  const diffInDays: number = diffInHours / 24;

  switch (true) {
    case Math.floor(diffInDays) >= 30:
      return formatDateString(date);
    case Math.floor(diffInDays) === 1:
      return `${Math.floor(diffInDays)} day ago`;
    case Math.floor(diffInDays) > 1 && diffInDays < 30:
      return `${Math.floor(diffInDays)} days ago`;
    case Math.floor(diffInHours) >= 1:
      return `${Math.floor(diffInHours)} hours ago`;
    case Math.floor(diffInMinutes) >= 1:
      return `${Math.floor(diffInMinutes)} minutes ago`;
    default:
      return 'Just now';
  }
};

export function convertTimestampToDate(timestamp: Date | { seconds: number; nanoseconds: number }): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  } else {
    const seconds = timestamp.seconds * 1000;
    const nanoseconds = timestamp.nanoseconds / 1000000;
    const milliseconds = seconds + nanoseconds;
    return new Date(milliseconds);
  }
}

export function isNotValidateUserCredentials(user: NewUser) {
  return !user.email || !user.password || !user.username;
}

export function isNotValidateUserProfileCredentials(username: string, avatarUrl: string) {
  return !username.trim() || !avatarUrl.trim()
}
