# AGENT.md — エージェント向け開発ガイド

入口は `CLAUDE.md`。共通スキル/エージェントはこのファイルの見出しを読む（契約: orchestrator `shared/CONTRACT.md`）。

## Architecture

`@008h/design` — たのしくなること各サイト(photo / blog / pixtitch / tanoshikunarukoto.org)の共通デザインシステム。CSS カスタムプロパティが正本(ADR-001)。

- `src/tokens/base.css` — ニュートラル色(`--surface` `--danger` を含む)、font stack、spacing。色トークン名は photo 由来(`--bg` `--fg` `--muted` `--line`)で変えない
- `src/tokens/accents.css` — `--accent-1..5`。L/C は全色で揃え、hue だけ変える
- `src/themes/<site>.css` — サイト別の地色の上書き。セレクタは `:root[data-site='<site>']`
- `src/tokens/index.css`(`tokens.css` として export)— トークンだけの入口
- `src/base.css` / `src/index.css` — 本文・リンク・フォーカスの最小スタイルと入口
- `src/color/contrast.ts` — oklch → WCAG コントラスト比(純粋関数)
- `src/tokens/parse.ts` — トークン CSS の解析(テストと check-colors が使う)
- `src/uno/` `src/tailwind/` — UnoCSS / Tailwind v4 のアダプタ(var() への対応付けだけ)
- `src/astro/` `src/scripts/` — ThemeToggle など小さな部品
- `src/cli/` — `tanoshi-check-colors`
- `tests/` — vitest(トークンのコントラストと整合性)

## Gate

- コマンド: `pnpm gate`(`check:colors` → `lint:css` → `typecheck` → `astro:check` → `test` → `build` → `check:dist` → `e2e`)
- **ゲート自体を緩める変更は禁止**: テストの `skip`、閾値(コントラスト比 4.5 / 3)の引き下げ、`.stylelintrc.json` の緩和。失敗は色の側を直す

### 指摘の優先順位

動作不良 > a11y(コントラスト) > 見た目

### 失敗時の対処

| 段 | 対処 |
|---|---|
| `lint:css` | `pnpm lint:css:fix` で宣言順を直す。`:root` 内のカスタムプロパティは対象外 |
| `typecheck` | 該当箇所の型を直す |
| `test` | コントラスト不足は該当トークンの L/C を調整する(テストの閾値は動かさない)。dark ブロックと `prefers-color-scheme` ブロックは同じ内容にする |
| `build` | `tsc -p tsconfig.build.json` のエラーを直す |
| `check:dist` | `pnpm build` して `dist/` をコミットに含める(`dist/` は git 依存で配る成果物) |

## Test policy

- TDD 対象: `src/color/`、`src/tokens/parse.ts`、`src/cli/` の純粋関数
- フレームワーク: vitest
- 配置: 対象と同じディレクトリの `<module>.test.ts`。トークン全体の検証は `tests/`
- 単体実行: `pnpm vitest run <path>`

## Review checklist

1. **色の置き場所**: `oklch()` リテラルが `src/tokens/` と `src/themes/` の外にないか。hex / rgb / 名前付きカラーがないか
2. **トークン名**: photo 由来の名前(`--bg` `--fg` `--muted` `--line` `--font-sans`)を変えていないか。破壊的変更は semver の major
3. **ダークの 3 ブロック**: `:root[data-theme='dark']` と `prefers-color-scheme` ブロックが同内容か。新しいトークンを足したら 3 ブロックすべてに入れたか
4. **アクセントの使い方**: 本文の文字色に使っていないか(ドット、下線、アイコンなどの小さな面だけ)
5. **dist**: `src/` の変更に対応する `dist/` が同じコミットに入っているか
6. **コメント**: 新規コードに不要なコメントを足していないか

### パス別の追加エージェント

なし。
