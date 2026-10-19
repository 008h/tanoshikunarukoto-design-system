const RULE = /([^{}]+)\{([^{}]*)\}/g;
const MEDIA = /@media\s*([^{]+)\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g;
function parseDeclarations(body) {
    const props = {};
    for (const declaration of body.split(';')) {
        const index = declaration.indexOf(':');
        if (index < 0)
            continue;
        const name = declaration.slice(0, index).trim();
        if (name.startsWith('--'))
            props[name] = declaration.slice(index + 1).trim();
    }
    return props;
}
function parseRules(css, media) {
    return [...css.matchAll(RULE)].map((match) => ({
        selector: (match[1] ?? '').trim(),
        media,
        props: parseDeclarations(match[2] ?? ''),
    }));
}
export function parseBlocks(css) {
    const blocks = [];
    let rest = css;
    for (const match of css.matchAll(MEDIA)) {
        blocks.push(...parseRules(match[2] ?? '', (match[1] ?? '').trim()));
        rest = rest.replace(match[0], '');
    }
    return [...parseRules(rest, null), ...blocks];
}
