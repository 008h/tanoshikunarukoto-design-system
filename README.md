# @008h/design

たのしくなること(tanoshikunarukoto)の各サイトで共有するデザインシステム。CSS カスタムプロパティを正本に、UnoCSS / Tailwind v4 のアダプタと Astro の小さな部品を配る。

## Install

```sh
pnpm add github:008h/tanoshikunarukoto-design-system#v0.3.0
pnpm add @fontsource-variable/urbanist @fontsource/kosugi
```

npm には公開しない。git のタグで版を固定し、ビルド済みの `dist/` をリポジトリにコミットして配る(インストール時にビルドは走らない)。更新するときは、タグを新しくして各サイトの指定を書き換える。

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

- `@008h/design/tokens.css` はトークンだけ(`base.css` の本文・リンク・フォーカスのスタイルを含まない)。既に自前のベーススタイルを持つサイト向け
- Astro の `ClientRouter` を使うサイトは、`<html data-site="...">` をレイアウトに直接書く。遷移時に `<html>` の属性が差し替わり、`ThemeScript` が実行時に付けた `data-site` は消える(`data-theme` は復元される)
- `<html data-site="...">` でテーマ(`pixtitch` / `blog`)、`data-theme="light|dark"` でモードを切り替える。`ThemeScript` が両方を初期化する
- UnoCSS: `presets: [presetWind4(), presetTanoshi()]`(`@008h/design/uno`)。`bg-bg` `text-fg` `border-line` `text-accent-1` が使える
- Tailwind v4: `@import '@008h/design/tailwind.css';`

## Tokens

| トークン | 用途 |
|---|---|
| `--bg` `--fg` `--muted` `--line` | 地、文字、補助文字、罫線 |
| `--surface` `--danger` | カードやパネルの地、エラー文字(`--bg` と `--surface` の両方の上でコントラスト 4.5 以上) |
| `--accent-1..5` | ドット、下線、アイコンなどの小さな面。本文の文字色には使わない |
| `--font-sans` `--font-display` | 本文、見出し |
| `--space-1..5` `--measure` `--radius` | 余白、本文幅、角丸 |

## Changelog

- 0.3.0: `--surface` `--danger` を追加。pixtitch テーマの `--bg` `--fg` を exact な `#f0ede8` / `#232025` に変更し、`--scrim`(light / dark とも、alpha 0.8)を追加。`ThemeToggle` の色を `--theme-toggle-color` で変更可能に
- 0.2.0: `tokens.css`(トークンだけの入口)を追加

`ThemeToggle` の色は `--theme-toggle-color`(既定は `--muted`)で変えられる。

## check-colors

```sh
tanoshi-check-colors --allow-oklch src/styles/
```

`src` と `public` を走査し、hex / rgb / 名前付きカラー / パレットのユーティリティクラスを禁止する。`oklch()` は `--allow-oklch` で指定したファイルのカスタムプロパティ宣言にだけ許す。

## Development

`pnpm gate`(check-colors → stylelint → tsc → astro check → vitest → build → check-dist → e2e)。`src/` を変えたら `pnpm build` して `dist/` も一緒にコミットする。方針は `docs/AGENT.md` と `docs/DECISIONS.md`。
