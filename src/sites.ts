export const SITES = [
  { id: 'main', label: 'たのしくなること', href: 'https://tanoshikunarukoto.org', accent: 'accent-1' },
  { id: 'blog', label: 'blog', href: 'https://blog.tanoshikunarukoto.org', accent: 'accent-2' },
  { id: 'photo', label: 'photo', href: 'https://photo.tanoshikunarukoto.org', accent: 'accent-3' },
  { id: 'pixtitch', label: 'pixtitch', href: 'https://pixtitch.net', accent: 'accent-4' },
] as const;

export type SiteId = (typeof SITES)[number]['id'];
