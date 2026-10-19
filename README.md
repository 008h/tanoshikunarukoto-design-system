# @008h/design

たのしくなること(tanoshikunarukoto)の各サイトで共有するデザインシステム。CSS カスタムプロパティを正本に、UnoCSS / Tailwind v4 のアダプタと Astro の小さな部品を配る。

## Install

```sh
pnpm add @008h/design
pnpm add @fontsource-variable/urbanist @fontsource/kosugi
```

フォントは配らない。サイト側で上の 2 つを import する(`--font-sans` は Urbanist → Kosugi の順)。

## Use

```astro
---
import '@fontsource-variable/urbanist';
import '@fontsource/kosugi';
import '@008h/design/index.css';
import '@008h/design/themes/pixtitch.css'; // サイト別の地色(任意)
import ThemeScript from '@008h/design/astro/ThemeScript.astro';
import ThemeToggle from '@008h/design/astro/ThemeToggle.astro';
import SiteFooter from '@008h/design/astro/SiteFooter.astro';
---
<html lang="ja">
  <head><ThemeScript site="pixtitch" /></head>
  <body><ThemeToggle /><SiteFooter current="pixtitch" /></body>
</html>
```

- `<html data-site="...">` でテーマ(`pixtitch` / `blog`)、`data-theme="light|dark"` でモードを切り替える。`ThemeScript` が両方を初期化する
- UnoCSS: `presets: [presetWind4(), presetTanoshi()]`(`@008h/design/uno`)。`bg-bg` `text-fg` `border-line` `text-accent-1` が使える
- Tailwind v4: `@import '@008h/design/tailwind.css';`

## Tokens

| トークン | 用途 |
|---|---|
| `--bg` `--fg` `--muted` `--line` | 地、文字、補助文字、罫線 |
| `--accent-1..5` | ドット、下線、アイコンなどの小さな面。本文の文字色には使わない |
| `--font-sans` `--font-display` | 本文、見出し |
| `--space-1..5` `--measure` `--radius` | 余白、本文幅、角丸 |

## check-colors

```sh
tanoshi-check-colors --allow-oklch src/styles/
```

`src` と `public` を走査し、hex / rgb / 名前付きカラー / パレットのユーティリティクラスを禁止する。`oklch()` は `--allow-oklch` で指定したファイルのカスタムプロパティ宣言にだけ許す。

## Development

`pnpm gate`(check-colors → stylelint → tsc → astro check → vitest → build → e2e)。方針は `docs/AGENT.md` と `docs/DECISIONS.md`。
