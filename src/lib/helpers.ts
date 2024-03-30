export function dateCustomFormatting(date: Date): string {
  const padStart = (value: number): string => value.toString().padStart(2, '0');
  return `${padStart(date.getDate())}-${padStart(date.getMonth() + 1)}-${date.getFullYear()}`;
}

// export function formatDateString(dateString: string) {
//   const options: Intl.DateTimeFormatOptions = {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//   };

//   const date = new Date(dateString);
//   const formattedDate = date.toLocaleDateString('en-US', options);

//   const time = date.toLocaleTimeString([], {
//     hour: 'numeric',
//     minute: '2-digit',
//   });

//   return `${formattedDate} at ${time}`;
// }

export const multiFormatDateString = (timestamp: any = ''): string => {
  if (timestamp && timestamp.seconds && timestamp.nanoseconds) {
    const seconds = timestamp.seconds * 1000;
    const nanoseconds = timestamp.nanoseconds / 1000000;
    const milliseconds = seconds + nanoseconds;
    timestamp = new Date(milliseconds);
  }

  const date: Date = new Date(timestamp);
  const now: Date = new Date();

  const diff: number = now.getTime() - date.getTime();
  const diffInSeconds: number = Math.abs(diff) / 1000;
  const diffInMinutes: number = diffInSeconds / 60;
  const diffInHours: number = diffInMinutes / 60;

  if (diffInHours >= 1) {
    return `${Math.floor(diffInHours)} ${Math.floor(diffInHours) === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInMinutes >= 1) {
    return `${Math.floor(diffInMinutes)} ${Math.floor(diffInMinutes) === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return 'Just now';
  }
};
