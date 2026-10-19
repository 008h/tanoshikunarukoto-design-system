export interface TokenBlock {
  selector: string;
  media: string | null;
  props: Record<string, string>;
}

const RULE = /([^{}]+)\{([^{}]*)\}/g;
const MEDIA = /@media\s*([^{]+)\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g;

function parseDeclarations(body: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const declaration of body.split(';')) {
    const index = declaration.indexOf(':');
    if (index < 0) continue;
    const name = declaration.slice(0, index).trim();
    if (name.startsWith('--')) props[name] = declaration.slice(index + 1).trim();
  }
  return props;
}

function parseRules(css: string, media: string | null): TokenBlock[] {
  return [...css.matchAll(RULE)].map((match) => ({
    selector: (match[1] ?? '').trim(),
    media,
    props: parseDeclarations(match[2] ?? ''),
  }));
}

export function parseBlocks(css: string): TokenBlock[] {
  const blocks: TokenBlock[] = [];
  let rest = css;
  for (const match of css.matchAll(MEDIA)) {
    blocks.push(...parseRules(match[2] ?? '', (match[1] ?? '').trim()));
    rest = rest.replace(match[0], '');
  }
  return [...parseRules(rest, null), ...blocks];
}
