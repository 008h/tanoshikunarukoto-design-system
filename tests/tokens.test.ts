import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, parseOklch, toSrgbHex } from '../src/color/contrast.js';
import { parseBlocks, type TokenBlock } from '../src/tokens/parse.js';

const read = (path: string): TokenBlock[] =>
  parseBlocks(readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8'));

const CORE = [...read('tokens/base.css'), ...read('tokens/accents.css')];
const SITES = ['pixtitch', 'blog'] as const;
const MODES = ['light', 'dark'] as const;
type Mode = (typeof MODES)[number];

const DARK = "[data-theme='dark']";

const layer = (blocks: TokenBlock[], selector: string): Record<string, string> =>
  Object.assign({}, ...blocks.filter((b) => !b.media && b.selector === selector).map((b) => b.props));

const siteBlocks = (site: string): TokenBlock[] => read(`themes/${site}.css`);
const siteRoot = (site: string): string => `:root[data-site='${site}']`;

function resolve(mode: Mode, site?: string): Record<string, string> {
  const light = { ...layer(CORE, ':root'), ...(site ? layer(siteBlocks(site), siteRoot(site)) : {}) };
  if (mode === 'light') return light;
  const dark = layer(CORE, `:root${DARK}`);
  return { ...light, ...dark, ...(site ? layer(siteBlocks(site), `${siteRoot(site)}${DARK}`) : {}) };
}

const color = (tokens: Record<string, string>, name: string) => {
  const parsed = parseOklch(tokens[name] ?? '');
  if (!parsed) throw new Error(`${name} is not an oklch() value: ${tokens[name]}`);
  return parsed;
};

const ACCENTS = ['--accent-1', '--accent-2', '--accent-3', '--accent-4', '--accent-5'];

const targets = [
  ...MODES.map((mode) => ({ label: `base ${mode}`, mode, site: undefined as string | undefined })),
  ...SITES.flatMap((site) => MODES.map((mode) => ({ label: `${site} ${mode}`, mode, site }))),
];

describe.each(targets)('contrast: $label', ({ mode, site }) => {
  const tokens = resolve(mode, site);

  it('fg on bg is at least 4.5', () => {
    expect(contrastRatio(color(tokens, '--fg'), color(tokens, '--bg'))).toBeGreaterThanOrEqual(4.5);
  });

  it('muted on bg is at least 4.5', () => {
    expect(contrastRatio(color(tokens, '--muted'), color(tokens, '--bg'))).toBeGreaterThanOrEqual(4.5);
  });

  it('fg on surface is at least 4.5', () => {
    expect(contrastRatio(color(tokens, '--fg'), color(tokens, '--surface'))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['--bg', '--surface'])('danger on %s is at least 4.5', (surface) => {
    expect(contrastRatio(color(tokens, '--danger'), color(tokens, surface))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(ACCENTS)('%s on bg is at least 3', (name) => {
    expect(contrastRatio(color(tokens, name), color(tokens, '--bg'))).toBeGreaterThanOrEqual(3);
  });
});

describe('prefers-color-scheme block mirrors the dark block', () => {
  const files = ['tokens/base.css', 'tokens/accents.css', 'themes/pixtitch.css', 'themes/blog.css'];
  it.each(files)('%s', (file) => {
    const blocks = read(file);
    const dark = blocks.filter((b) => !b.media && b.selector.endsWith("[data-theme='dark']"));
    const media = blocks.filter((b) => b.media === '(prefers-color-scheme: dark)');
    expect(media.map((b) => b.props)).toEqual(dark.map((b) => b.props));
  });
});

describe.each(SITES)('site theme %s', (site) => {
  it('redefines in dark every color its light block overrides', () => {
    const light = Object.keys(layer(siteBlocks(site), siteRoot(site))).filter((name) => parseOklch(layer(siteBlocks(site), siteRoot(site))[name] ?? ''));
    const dark = Object.keys(layer(siteBlocks(site), `${siteRoot(site)}${DARK}`));
    expect(dark).toEqual(expect.arrayContaining(light));
  });
});

describe('pixtitch theme matches the cloth baked into pixtitch-next assets', () => {
  const tokens = resolve('light', 'pixtitch');

  it('--bg is #f0ede8', () => {
    expect(toSrgbHex(color(tokens, '--bg'))).toBe('#f0ede8');
  });

  it('--fg is #232025', () => {
    expect(toSrgbHex(color(tokens, '--fg'))).toBe('#232025');
  });
});
