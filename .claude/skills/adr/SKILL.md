---
name: adr
description: docs/DECISIONS.md に ADR（設計判断の記録）を追記・更新する。DECISIONS に記載の無い設計判断が必要になったとき、既存 ADR を確定/変更/supersede するときに使う。使い方 /adr <決定事項の要約>
argument-hint: "<decision summary>"
---
<!-- managed by orchestrator (shared/skills/adr/SKILL.md). Do not edit here; edit in orchestrator and re-run scripts/sync.sh -->

# ADR の追記・更新

ADR の置き場所は `docs/AGENT.md` に記載があればそれに従い(例: `docs/adr/`)、無ければ `docs/DECISIONS.md`。以下では `docs/DECISIONS.md` と書く。これが設計判断の唯一の記録場所。**「未記載の設計判断が必要になったら、実装の前に ADR を書く」**が `/work` `/iterate` の停止条件。

## 新規 ADR
1. 既存 ADR の番号を確認し次の連番（`ADR-NNN`）を採番
2. 末尾に追記:

```markdown
## ADR-NNN: <タイトル>

- **状態**: `proposed`
- **背景**: なぜ必要になったか（どの作業で遭遇したか）
- **決定**: 何を決めたか
- **根拠**: なぜその選択か（データ・実測・トレードオフ）
- **影響**: 影響するファイル/パッケージ
```

3. 状態: `proposed`（一旦の決め打ち。後で覆る可能性あり）/ `accepted`（実測・検証済みで確定）

## 既存 ADR の更新
- 検証完了 → `proposed` を `accepted` にし、決定内容を実測に基づいて更新。関連 doc も同時に更新
- 決定を覆す → 元の ADR は残して `superseded` にし、新 ADR に `- 旧ADR-NNN を supersede` と明記。**ADR は削除しない**

## 注意
根拠を必ず書く（「良さそう」ではなく「実測で〜だった」）。変数名やファイル分割など些細な判断は ADR にしない。他の実装判断に波及する、または覆すコストが高いものに絞る。

ADR の本文が日本語なら、保存前に `/yomiyasu` の手順で推敲し、`yomiyasu_lint.py` の検出を確かめる。
