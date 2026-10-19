# DECISIONS

設計判断の記録。追記は `/adr`。ADR は削除せず、覆す場合は `superseded` にして新 ADR を追加する。

## ADR-001: CSS カスタムプロパティを正本にし、フレームワーク別アダプタで配る

- 状態: accepted
- 背景: 4 サイトが UnoCSS(photo)、Tailwind v4(pixtitch-next)、素の CSS(blog)とばらばらで、色の持ち方も異なる。特定のフレームワークに寄せると、他のサイトに移行コストを強いる。
- 決定: トークンは CSS カスタムプロパティで定義する。UnoCSS preset と Tailwind v4 `@theme inline` は、変数を `var()` で参照する薄いアダプタに留める。トークン名は photo の `--bg` `--fg` `--muted` `--line` `--font-sans` を踏襲する。サイトごとの地色は `data-site` 属性のテーマで上書きし、ライト/ダークは `data-theme` で切り替える。
- 根拠: CSS 変数ならフレームワーク非依存で、runtime でテーマを切り替えられる。photo の名前を引き継げば、photo の移行は置換だけで済む。
- 影響: サイトは `<html data-site="...">` を設定する必要がある。トークンの追加は、light / dark / `prefers-color-scheme` の 3 ブロックすべてに入れる。コントラストは vitest(`tests/tokens.test.ts`)で検証する。
