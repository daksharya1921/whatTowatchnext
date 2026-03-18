import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils cn()', () => {
  it('merges tailwind classes correctly', () => {
    expect(cn('px-2', 'py-2')).toBe('px-2 py-2');
    expect(cn('px-2 py-1', 'py-2')).toBe('px-2 py-2');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    expect(cn('p-4', null, undefined, 'p-2', false)).toBe('p-2');
  });
});
