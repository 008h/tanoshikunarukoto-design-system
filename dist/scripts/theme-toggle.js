import { THEME_STORAGE_KEY, nextTheme, resolveTheme } from './theme.js';
const TOGGLE_SELECTOR = '[data-theme-toggle]';
const DARK_QUERY = window.matchMedia('(prefers-color-scheme: dark)');
const readStored = () => {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    }
    catch {
        return null;
    }
};
const currentTheme = () => resolveTheme(readStored(), DARK_QUERY.matches);
function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll(TOGGLE_SELECTOR).forEach((el) => el.setAttribute('aria-label', `Theme: ${theme}`));
}
function choose(theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    catch {
        // storage unavailable: the choice lasts for this page view only
    }
    apply(theme);
}
document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest(TOGGLE_SELECTOR))
        return;
    choose(nextTheme(currentTheme()));
});
DARK_QUERY.addEventListener('change', () => {
    if (readStored() === null)
        apply(currentTheme());
});
document.addEventListener('astro:after-swap', () => apply(currentTheme()));
apply(currentTheme());
