# AGENT.md — エージェント向け開発ガイド

ルートの `CLAUDE.md` が入口。共通スキル/エージェントはこのファイルの見出しを読む（契約: orchestrator `shared/CONTRACT.md`）。

## Architecture

<!-- パッケージ/ディレクトリ構成、依存方向、既存ユーティリティ一覧 -->

## Gate

- コマンド: `pnpm gate`
- UI 変更時: `pnpm gate:full`

### ゲート通過後のレビュー

<!-- 任意。ゲート通過後に並列起動するエージェント(例: ui-reviewer)。無ければ節ごと削除 -->

### 指摘の優先順位

<!-- 任意。/fix-loop が使う。既定: 動作不良 > セキュリティ > a11y > 見た目 -->

### 失敗時の対処

| 段 | 失敗の意味 | 対処 |
|---|---|---|
| <!-- 例: 依存方向 --> | | |

## Test policy

- TDD 対象: <!-- 例: packages/*/src の純粋ロジック -->
- フレームワーク: <!-- vitest -->
- 配置: 対象と同じディレクトリの `<module>.test.ts`
- 単体実行: <!-- pnpm --filter <pkg> test -->

## Review checklist

1. <!-- リポジトリ固有の観点 -->

### パス別の追加エージェント

| パス | エージェント |
|---|---|
| <!-- packages/foo/** --> | <!-- foo-guardian --> |

## Verify

<!-- 任意。/verify が headless Chromium(Playwright)で動作確認するための情報 -->
- 起動: <!-- pnpm dev -->
- URL / ポート: <!-- http://localhost:4321 -->
- 準備完了の判定: <!-- URL が 200 を返す -->
- 主要な画面: <!-- / , /editor -->
- ブラウザの用意: `pnpm exec playwright install chromium`

## Roadmap

<!-- ROADMAP.md を使う場合のみ。同期コマンド: pnpm roadmap -->
