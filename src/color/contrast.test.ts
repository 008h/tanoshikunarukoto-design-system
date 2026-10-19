import { describe, expect, it } from 'vitest';
import { contrastRatio, parseOklch, relativeLuminance, toSrgbHex } from './contrast.js';

describe('parseOklch', () => {
  it('parses lightness, chroma and hue', () => {
    expect(parseOklch('oklch(0.62 0.15 260)')).toEqual({ l: 0.62, c: 0.15, h: 260, alpha: 1 });
  });

  it('parses alpha', () => {
    expect(parseOklch('oklch(0.1 0 0 / 0.97)')?.alpha).toBe(0.97);
  });

  it('returns null for non-oklch values', () => {
    expect(parseOklch('#fff')).toBeNull();
    expect(parseOklch('var(--bg)')).toBeNull();
  });
});

describe('relativeLuminance', () => {
  it('is 1 for white and 0 for black', () => {
    expect(relativeLuminance({ l: 1, c: 0, h: 0, alpha: 1 })).toBeCloseTo(1, 2);
    expect(relativeLuminance({ l: 0, c: 0, h: 0, alpha: 1 })).toBeCloseTo(0, 3);
  });
});

describe('contrastRatio', () => {
  it('is 21 between black and white', () => {
    const white = { l: 1, c: 0, h: 0, alpha: 1 };
    const black = { l: 0, c: 0, h: 0, alpha: 1 };
    expect(contrastRatio(white, black)).toBeCloseTo(21, 0);
  });

  it('is symmetric', () => {
    const a = { l: 0.62, c: 0.15, h: 260, alpha: 1 };
    const b = { l: 0.985, c: 0, h: 0, alpha: 1 };
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10);
  });

  it('is 1 for identical colors', () => {
    const a = { l: 0.5, c: 0.1, h: 120, alpha: 1 };
    expect(contrastRatio(a, a)).toBeCloseTo(1, 10);
  });
});

describe('toSrgbHex', () => {
  it('converts white, black and mid grey', () => {
    expect(toSrgbHex({ l: 1, c: 0, h: 0, alpha: 1 })).toBe('#ffffff');
    expect(toSrgbHex({ l: 0, c: 0, h: 0, alpha: 1 })).toBe('#000000');
    expect(toSrgbHex({ l: 0.5999, c: 0, h: 0, alpha: 1 })).toBe('#808080');
  });

  it('round-trips a known sRGB color', () => {
    expect(toSrgbHex({ l: 0.6279, c: 0.2577, h: 29.23, alpha: 1 })).toBe('#ff0000');
  });
});
