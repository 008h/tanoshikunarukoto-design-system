export const COLOR_TOKENS = ['bg', 'fg', 'muted', 'line', 'accent-1', 'accent-2', 'accent-3', 'accent-4', 'accent-5'] as const;

export type ColorToken = (typeof COLOR_TOKENS)[number];
