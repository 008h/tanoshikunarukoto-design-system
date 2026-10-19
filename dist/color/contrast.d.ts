export interface Oklch {
    l: number;
    c: number;
    h: number;
    alpha: number;
}
export declare function parseOklch(value: string): Oklch | null;
export declare function relativeLuminance(color: Oklch): number;
export declare function contrastRatio(a: Oklch, b: Oklch): number;
export declare function toSrgbHex(color: Oklch): string;
