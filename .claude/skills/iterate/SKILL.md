---
name: iterate
description: docs/BACKLOG.md から未完了タスクを1件選び、TDD で実装し、ゲート通過後に atomic commit して BACKLOG を更新する。1回の呼び出しで1イテレーション（1タスク=1コミット）。/loop /iterate で自走できる。
argument-hint: "[focus]"
---
<!-- managed by orchestrator (shared/skills/iterate/SKILL.md). Do not edit here; edit in orchestrator and re-run scripts/sync.sh -->

# 1イテレーションの実行

1回の呼び出しで**タスク1件だけ**を完遂する。`$ARGUMENTS` に焦点が指定されていれば、それに合致するタスクを優先する。

## 0. BACKLOG が無いリポジトリ
`docs/BACKLOG.md` が無く、`docs/AGENT.md` の `## Gate` に「ゲート通過後のレビュー」が定義されている場合は、このスキルではなく `/fix-loop $ARGUMENTS` を実行して終了する。どちらも無ければ、「BACKLOG もレビュー定義も無い」と報告して停止する。

## 1. タスク選択
- `docs/BACKLOG.md` を読み、`## High` の未完了タスク（`- [ ]`）の最上位を選ぶ。High が空なら `## Low` から
- **停止条件**: 未完了タスクが無い → 「BACKLOG が空」と報告して終了。完了条件が書かれていない → 着手せず、条件案を BACKLOG に追記して報告
- 1コミットで完遂できない粒度なら、実装せず BACKLOG 上で分割して報告（分割自体をこのイテレーションの成果とする）

## 2. 実装
- 着手前に `git status` を確認。**自分のタスクと無関係な未コミット変更には触れない**
- `docs/AGENT.md` の `## Architecture` で既存ユーティリティを確認し、再利用を優先する
- `## Test policy` の TDD 対象に該当するコードは RED → GREEN → REFACTOR。RED は `test-writer` エージェントに委任できる
- 設計判断が必要で `docs/DECISIONS.md` に記載が無ければ、実装を止めて `/adr` を提案し報告する

## 3. ゲート
- `/gate` の手順でゲートを通す
- **停止条件**: 同じ原因で3回失敗 → 状況を BACKLOG のタスク欄にメモして停止・報告

UI・挙動に触れたタスクなら、コミットの前に `/verify` で動作確認まで行う。

## 4. コミット
- このタスクで変更したファイルだけを `git add` し、Conventional Commits（英語）で1コミット
- ゲート未通過でのコミット、`--no-verify` は禁止

## 5. 記録
- 該当タスクを `## Done` へ移し `(commit hash)` を付記
- 実装中に見つけた課題・負債は完了条件付きで BACKLOG に追記
- BACKLOG の変更もタスクと同じコミットに含めて良い

## 報告
完了時: 消化したタスク / コミット hash / ゲート結果 / 追加した課題。停止時: 該当した停止条件と、人間に必要な判断。
