import { it, expect, describe } from 'vitest';
import { dateCustomFormatting } from '@/lib/helpers';

describe('dateCustomFormatting()', () => {
  it('should format a date object to "dd-mm-yyyy" format', () => {
    const date = new Date(2023, 4, 15);
    const formattedDate = dateCustomFormatting(date);
    expect(formattedDate).toBe('15-05-2023');
  });
});