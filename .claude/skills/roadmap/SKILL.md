---
name: roadmap
description: ROADMAP 同期コマンド（docs/AGENT.md の `## Roadmap` に記載）を実行して docs/ROADMAP.md を GitHub issue の状態で更新し、進捗サマリを報告する。未起票タスクがあれば /issue での起票を提案する。
---
<!-- managed by orchestrator (shared/skills/roadmap/SKILL.md). Do not edit here; edit in orchestrator and re-run scripts/sync.sh -->

# ROADMAP の同期と進捗報告

`docs/ROADMAP.md` は「issue の close が唯一の完了トリガー」であり、手で done に書き換えない。

## 手順
1. `docs/AGENT.md` の `## Roadmap` 節から同期コマンド（例 `pnpm roadmap`）を読み、ルートで実行する。節が無ければ停止して契約未整備を報告する
2. `gh` が未認証/リポジトリ未作成で失敗した場合は ROADMAP.md を変更せず、ユーザーに `gh auth login` かリポジトリ作成の確認を求める

## 報告
- フェーズ別の進捗率（例 `P1: 3/11 done (27%)`）
- 未起票タスク一覧。多ければ依存が解決済みのものを上位から挙げ、`/issue` での起票を提案
- クリティカルパス上のタスクの進捗を強調する
