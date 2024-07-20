import { it, expect } from 'vitest';
import { dateCustomFormatting } from './helpers';

// Formats a date object to 'dd-mm-yyyy' format
it('should format a date object to "dd-mm-yyyy" format', () => {
  const date = new Date(2023, 4, 15); // 15th May 2023
  const formattedDate = dateCustomFormatting(date);
  expect(formattedDate).toBe('15-05-2023');
});
