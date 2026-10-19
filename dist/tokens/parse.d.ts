export interface TokenBlock {
    selector: string;
    media: string | null;
    props: Record<string, string>;
}
export declare function parseBlocks(css: string): TokenBlock[];
