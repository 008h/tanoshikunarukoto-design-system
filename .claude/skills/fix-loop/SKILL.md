---
name: fix-loop
description: /gate を実行し、REJECT などの指摘を優先度順に1件ずつ修正して再度 /gate を回す、すべて APPROVE になるまでのループ。ゲート通過後のレビューエージェントがあるリポジトリで、「ループで改善して」「/fix-loop」と頼まれたときに使う。使い方 /fix-loop [focus]
argument-hint: "[focus]"
---
<!-- managed by orchestrator (shared/skills/fix-loop/SKILL.md). Do not edit here; edit in orchestrator and re-run scripts/sync.sh -->

# 指摘がなくなるまでのループ

`$ARGUMENTS` に焦点(例: "lightbox のa11y" "余白")が指定されていれば、その観点を優先して修正する。BACKLOG のタスクを消化する `/iterate` とは別物で、こちらは**ゲートとレビューの指摘**を対象にする。

## 手順

1. `/gate` を実行する
2. すべて APPROVE(ゲートも pass)なら「全APPROVE、ループ終了」と報告して停止する
3. REJECT または STOP があれば、指摘を優先度順に並べ、最重要の1件だけを修正する。優先度は `docs/AGENT.md` の `## Gate` に「指摘の優先順位」があればそれに従い、無ければ 動作不良 > セキュリティ > a11y > 見た目 とする
4. 修正後、1 に戻る

## 停止条件

- すべて APPROVE になったら停止する
- **同じ原因で3回失敗したら停止し、ユーザーに報告する**(ゲートを緩めて通過させない)
- ゲート自体を緩める変更は `/gate` の禁止事項により不可

## 報告

各周回の終わりに、修正した内容と次に残っている指摘を簡潔に報告する。停止条件に達したら理由を明示して止まる。
