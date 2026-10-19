export declare const SITES: readonly [{
    readonly id: "main";
    readonly label: "たのしくなること";
    readonly href: "https://tanoshikunarukoto.org";
    readonly accent: "accent-1";
}, {
    readonly id: "blog";
    readonly label: "blog";
    readonly href: "https://blog.tanoshikunarukoto.org";
    readonly accent: "accent-2";
}, {
    readonly id: "photo";
    readonly label: "photo";
    readonly href: "https://photo.tanoshikunarukoto.org";
    readonly accent: "accent-3";
}, {
    readonly id: "pixtitch";
    readonly label: "pixtitch";
    readonly href: "https://pixtitch.net";
    readonly accent: "accent-4";
}];
export type SiteId = (typeof SITES)[number]['id'];
