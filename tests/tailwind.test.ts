import { readFileSync } from 'node:fs';
import { compile } from '@tailwindcss/node';
import { describe, expect, it } from 'vitest';

describe('tailwind theme', () => {
  it('resolves color utilities to the shared CSS variables', async () => {
    const theme = readFileSync(new URL('../src/tailwind/theme.css', import.meta.url), 'utf8');
    const compiler = await compile(`@tailwind utilities;\n${theme}`, { base: process.cwd(), onDependency: () => {} });
    const css = compiler.build(['bg-bg', 'text-fg', 'border-line', 'text-accent-1']);
    expect(css).toContain('background-color: var(--bg)');
    expect(css).toContain('color: var(--fg)');
    expect(css).toContain('border-color: var(--line)');
    expect(css).toContain('color: var(--accent-1)');
  });
});
