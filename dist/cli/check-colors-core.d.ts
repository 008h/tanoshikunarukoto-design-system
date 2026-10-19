export interface CheckOptions {
    allowOklchPrefixes: readonly string[];
}
export interface Violation {
    file: string;
    lineNo: number;
    text: string;
    hint: string;
}
export declare function checkSource(file: string, text: string, options: CheckOptions): Violation[];
