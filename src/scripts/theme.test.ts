import { describe, expect, it } from 'vitest';
import { nextTheme, resolveTheme } from './theme.js';

describe('resolveTheme', () => {
  it('prefers a stored explicit choice', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('falls back to the OS preference when nothing valid is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme('sepia', false)).toBe('light');
  });
});

describe('nextTheme', () => {
  it('flips between light and dark', () => {
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('light');
  });
});
