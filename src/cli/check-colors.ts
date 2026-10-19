#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { parseArgs } from 'node:util';
import { checkSource, type Violation } from './check-colors-core.js';

const SRC_EXTS = new Set(['.css', '.astro', '.ts', '.js']);
const PUBLIC_EXTS = new Set(['.svg', '.js', '.css']);

const { values } = parseArgs({
  options: {
    src: { type: 'string', default: 'src' },
    public: { type: 'string', default: 'public' },
    'allow-oklch': { type: 'string', multiple: true, default: [] },
    exclude: { type: 'string', multiple: true, default: [] },
  },
});

const ROOT = process.cwd();

function walk(dir: string, exts: Set<string>, excluded: readonly string[]): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const full = join(dir, entry);
    if (excluded.some((prefix) => relative(ROOT, full).startsWith(prefix))) return [];
    if (statSync(full).isDirectory()) return walk(full, exts, excluded);
    return exts.has(extname(full)) && !full.endsWith('.test.ts') ? [full] : [];
  });
}

const options = { allowOklchPrefixes: values['allow-oklch'] ?? [] };
const excluded = values.exclude ?? [];
const files = [
  ...walk(join(ROOT, values.src ?? 'src'), SRC_EXTS, excluded),
  ...walk(join(ROOT, values.public ?? 'public'), PUBLIC_EXTS, excluded),
];

const violations: Violation[] = files.flatMap((path) =>
  checkSource(relative(ROOT, path), readFileSync(path, 'utf8'), options),
);

if (violations.length === 0) {
  console.log('check-colors: OK — every color is a design token.');
} else {
  console.error(`check-colors: ${violations.length} violation(s) found\n`);
  for (const v of violations) console.error(`${v.file}:${v.lineNo}  ${v.text}\n  → ${v.hint}\n`);
  process.exitCode = 1;
}
