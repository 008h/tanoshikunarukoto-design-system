import { describe, expect, it } from 'vitest';
import { checkSource, type CheckOptions } from './check-colors-core.js';

const site: CheckOptions = { allowOklchPrefixes: [] };
const hints = (file: string, text: string, options: CheckOptions = site): string[] =>
  checkSource(file, text, options).map((v) => v.hint);

describe('banned color syntax', () => {
  it.each([
    ['hex', 'a { color: #fff; }'],
    ['rgb', 'a { color: rgb(0 0 0); }'],
    ['rgba', 'a { color: rgba(0, 0, 0, 0.5); }'],
    ['hsl', 'a { color: hsl(0 0% 0%); }'],
    ['color-mix', 'a { color: color-mix(in oklch, red, blue); }'],
    ['named', 'a { color: red; }'],
    ['named in shorthand', 'a { border: red; }'],
  ])('rejects %s', (_, css) => {
    expect(hints('src/a.css', css)).not.toEqual([]);
  });

  it('rejects a named svg attribute', () => {
    expect(hints('src/a.astro', '<path fill="red" />')).not.toEqual([]);
  });

  it('allows var() and keyword values', () => {
    expect(hints('src/a.css', 'a { color: var(--fg); background: transparent; border: none; fill: currentColor; }')).toEqual([]);
  });
});

describe('oklch placement', () => {
  it('rejects an oklch literal outside allowed token files', () => {
    expect(hints('src/a.css', ':root { --x: oklch(0.5 0 0); }')).not.toEqual([]);
  });

  it('allows a custom property declaration in an allowed token file', () => {
    const options = { allowOklchPrefixes: ['src/tokens/'] };
    expect(hints('src/tokens/base.css', '  --bg: oklch(0.985 0 0);', options)).toEqual([]);
  });

  it('rejects an oklch literal that is not a custom property declaration, even in a token file', () => {
    const options = { allowOklchPrefixes: ['src/tokens/'] };
    expect(hints('src/tokens/base.css', 'a { color: oklch(0.5 0 0); }', options)).not.toEqual([]);
  });

  it('does not flag oklch inside standalone svg documents', () => {
    expect(hints('public/favicon.svg', '<rect fill="oklch(0.5 0.1 200)" />')).toEqual([]);
  });
});

describe('svg documents', () => {
  it('still rejects hex colors', () => {
    expect(hints('public/favicon.svg', '<rect fill="#fff" />')).not.toEqual([]);
  });
});

describe('utility color classes', () => {
  it('rejects palette utilities', () => {
    expect(hints('src/a.astro', '<p class="text-red-500 bg-white">x</p>')).toHaveLength(2);
  });

  it('allows the shared token utilities', () => {
    expect(hints('src/a.astro', '<p class="text-fg bg-bg border-line text-accent-1">x</p>')).toEqual([]);
  });
});

describe('violations carry position', () => {
  it('reports file and 1-based line number', () => {
    const [violation] = checkSource('src/a.css', 'a {}\nb { color: #fff; }', site);
    expect(violation).toMatchObject({ file: 'src/a.css', lineNo: 2 });
  });
});
