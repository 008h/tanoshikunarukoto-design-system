import { describe, expect, it } from 'vitest';
import { parseBlocks } from './parse.js';

describe('parseBlocks', () => {
  it('extracts custom properties per selector', () => {
    const css = ":root { --a: 1; --b: oklch(0.1 0 0 / 0.5); }\n:root[data-theme='dark'] { --a: 2; }";
    expect(parseBlocks(css)).toEqual([
      { selector: ':root', media: null, props: { '--a': '1', '--b': 'oklch(0.1 0 0 / 0.5)' } },
      { selector: ":root[data-theme='dark']", media: null, props: { '--a': '2' } },
    ]);
  });

  it('records the enclosing media query', () => {
    const css = '@media (prefers-color-scheme: dark) { :root:not([data-theme=\'light\']) { --a: 3; } }';
    expect(parseBlocks(css)).toEqual([
      {
        selector: ":root:not([data-theme='light'])",
        media: '(prefers-color-scheme: dark)',
        props: { '--a': '3' },
      },
    ]);
  });

  it('ignores non-custom properties', () => {
    expect(parseBlocks('a { color: red; --x: 1; }')[0]?.props).toEqual({ '--x': '1' });
  });
});
