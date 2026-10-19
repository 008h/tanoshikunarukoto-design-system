import { COLOR_TOKENS } from './tokens.js';
export function presetTanoshi() {
    const colors = Object.fromEntries(COLOR_TOKENS.map((name) => [name, `var(--${name})`]));
    return {
        name: '@008h/design',
        theme: { colors, font: { sans: 'var(--font-sans)', display: 'var(--font-display)' } },
    };
}
