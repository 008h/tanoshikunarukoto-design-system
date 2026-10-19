import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const listFiles = (dir, base = dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? listFiles(full, base) : [full.slice(base.length)];
  });

const out = mkdtempSync(join(tmpdir(), 'design-dist-'));
try {
  execFileSync('pnpm', ['exec', 'tsc', '-p', 'tsconfig.build.json', '--outDir', out], { stdio: 'inherit' });
  const expected = listFiles(out).sort();
  const actual = listFiles('dist').sort();
  const stale = [
    ...expected.filter((file) => !actual.includes(file)),
    ...actual.filter((file) => !expected.includes(file)),
    ...expected.filter((file) => actual.includes(file) && readFileSync(join(out, file), 'utf8') !== readFileSync(join('dist', file), 'utf8')),
  ];
  if (stale.length > 0) {
    console.error(`dist is out of date (run pnpm build):\n${[...new Set(stale)].join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log('check-dist: OK — dist matches src.');
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}
