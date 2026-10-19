import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBlocks } from '../tokens/parse.js';
import { presetTanoshi } from './preset.js';
import { COLOR_TOKENS } from './tokens.js';

const readSrc = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('presetTanoshi', () => {
  const theme = presetTanoshi().theme as { colors: Record<string, string>; font: Record<string, string> };

  it('maps every color token to its CSS variable', () => {
    for (const name of COLOR_TOKENS) {
      expect(theme.colors[name]).toBe(`var(--${name})`);
    }
  });

  it('maps sans font to the font variable', () => {
    expect(theme.font.sans).toBe('var(--font-sans)');
  });
});

describe('color tokens stay in sync with the CSS', () => {
  const defined = [
    ...parseBlocks(readSrc('tokens/base.css')),
    ...parseBlocks(readSrc('tokens/accents.css')),
  ]
    .filter((block) => block.selector === ':root')
    .flatMap((block) => Object.entries(block.props))
    .filter(([, value]) => value.startsWith('oklch('))
    .map(([name]) => name.slice(2));

  it('COLOR_TOKENS covers every opaque oklch token except scrim and shadow', () => {
    const opaque = defined.filter((name) => name !== 'scrim' && name !== 'shadow');
    expect([...COLOR_TOKENS].sort()).toEqual(opaque.sort());
  });

  it('tailwind theme maps exactly COLOR_TOKENS', () => {
    const css = readSrc('tailwind/theme.css');
    const mapped = [...css.matchAll(/--color-([\w-]+):\s*var\(--([\w-]+)\)/g)];
    expect(mapped.map(([, key, variable]) => [key, variable])).toEqual(COLOR_TOKENS.map((name) => [name, name]));
  });
});
