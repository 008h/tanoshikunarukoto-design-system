export const THEME_STORAGE_KEY = 'theme';
export function resolveTheme(stored, prefersDark) {
    if (stored === 'light' || stored === 'dark')
        return stored;
    return prefersDark ? 'dark' : 'light';
}
export function nextTheme(theme) {
    return theme === 'dark' ? 'light' : 'dark';
}
