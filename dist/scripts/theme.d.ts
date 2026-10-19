export type Theme = 'light' | 'dark';
export declare const THEME_STORAGE_KEY = "theme";
export declare function resolveTheme(stored: string | null, prefersDark: boolean): Theme;
export declare function nextTheme(theme: Theme): Theme;
