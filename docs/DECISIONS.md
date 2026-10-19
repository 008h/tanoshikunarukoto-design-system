# DECISIONS

設計判断の記録。追記は `/adr`。ADR は削除せず、覆す場合は `superseded` にして新 ADR を追加する。

## ADR-001: CSS カスタムプロパティを正本にし、フレームワーク別アダプタで配る

- 状態: accepted
- 背景: 4 サイトが UnoCSS(photo)、Tailwind v4(pixtitch-next)、素の CSS(blog)とばらばらで、色の持ち方も異なる。特定のフレームワークに寄せると、他のサイトに移行コストを強いる。
- 決定: トークンは CSS カスタムプロパティで定義する。UnoCSS preset と Tailwind v4 `@theme inline` は、変数を `var()` で参照する薄いアダプタに留める。トークン名は photo の `--bg` `--fg` `--muted` `--line` `--font-sans` を踏襲する。サイトごとの地色は `data-site` 属性のテーマで上書きし、ライト/ダークは `data-theme` で切り替える。
- 根拠: CSS 変数ならフレームワーク非依存で、runtime でテーマを切り替えられる。photo の名前を引き継げば、photo の移行は置換だけで済む。
- 影響: サイトは `<html data-site="...">` を設定する必要がある。トークンの追加は、light / dark / `prefers-color-scheme` の 3 ブロックすべてに入れる。コントラストは vitest(`tests/tokens.test.ts`)で検証する。

## ADR-002: npm に公開せず、git 依存とコミット済み dist で配る

- 状態: accepted
- 背景: 当初は npm 公開を想定したが、個人サイト 4 つのためだけの運用としては大げさだった(アカウント、トークン、publish の手間)。
- 決定: 各サイトは `github:008h/tanoshikunarukoto-design-system#<タグ>` を依存に指定する。インストール時にビルドが走る保証がないため、ビルド済みの `dist/` をコミットして配り、`pnpm check:dist` で `src/` と一致していることを gate で強制する。`package.json` は `private: true` にして誤公開を防ぐ。
- 根拠: レジストリもトークンも不要で、タグで版を固定できる。`.astro` と CSS はソースのまま配るので、ビルド成果物は `uno` / `sites` / CLI の `dist/` だけで足りる。
- 影響: 版を上げるときはタグを打ち、各サイトの指定を書き換える。リポジトリが private の場合、CI に読み取りトークンが要る(public なら不要)。ADR-001 の方針(CSS 変数が正本)は変わらない。
