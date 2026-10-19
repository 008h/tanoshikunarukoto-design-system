import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url);
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as {
  exports: Record<string, string | { default: string }>;
};

const targets = Object.entries(pkg.exports).flatMap(([key, value]) => {
  const path = typeof value === 'string' ? value : value.default;
  return key.includes('*') ? [] : [[key, path] as const];
});

describe('package exports', () => {
  it.each(targets)('%s points to an existing file', (_, path) => {
    expect(existsSync(new URL(path, root))).toBe(true);
  });

  it('tokens.css imports only the token files, not the base styles', () => {
    const css = readFileSync(new URL('src/tokens/index.css', root), 'utf8');
    const imports = [...css.matchAll(/@import\s+'([^']+)'/g)].map((match) => match[1]);
    expect(imports).toEqual(['./base.css', './accents.css']);
  });
});
