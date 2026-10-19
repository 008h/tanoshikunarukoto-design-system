---
name: issue
description: GitHub issue の作成・整形。ROADMAP のタスクから起票するとき、既存 issue を規約（type/優先度ラベル、検証条件）に合わせるとき、大きい構想を epic + 子 issue に分割するときに使う。
---
<!-- managed by orchestrator (shared/skills/issue/SKILL.md). Do not edit here; edit in orchestrator and re-run scripts/sync.sh -->

# issue の作成・整形

`docs/WORKFLOW.md` があればその規約を優先する。無ければ以下を既定値とする。

## 規約
- **type**: feat / fix / refactor / docs / test / chore / ci / perf、複数 issue を束ねる親は epic。Conventional Commits の prefix と一致させる
- **優先度**: P0（緊急）/ P1（高）/ P2（中・迷ったらこれ）/ P3（低）
- **タイトル**: `<type>: サマリ`（成果物が伝わる具体的な表現）
- **ラベル**: type ラベル1つ + P ラベル1つ
- **本文**: 背景 / 作業内容（チェックボックス）/ 検証（done の判定条件）。**検証条件が書けない issue は作成しない**
- 本文が日本語なら、`/yomiyasu` の手順で推敲し、`yomiyasu_lint.py` の検出を確かめてから投稿する

## ROADMAP タスクから起票する
1. `docs/ROADMAP.md` から対象タスク（`P<n>-<m>`）を選び、依存タスクが完了していることを確認
2. type はタスク表の type 列を使う。本文冒頭に `Task: <タスクID>` を必ず書き、完了条件を「検証」に転記する
3. 作成後、AGENT.md の `## Roadmap` に書かれた同期コマンドがあれば実行し、issue 列が更新されたことを確認する

## 新規作成
```bash
gh issue create --title "<type>: <サマリ>" --label <type> --label P2 --body "$(cat <<'BODY'
（背景・目的を1〜3行）

## 作業内容
- [ ] 具体的な作業ステップ

## 検証
- [ ] done と判定できる条件
BODY
)"
```
1 PR で完遂できない粒度なら epic にして子 issue へ分割し、子の本文冒頭に `Parent: #<epic>` を書く。

## 既存 issue の整形
`gh issue view <n>` → タイトルを `gh issue edit --title` で規約に → ラベル補完 → 検証条件が無ければ追記（意図が読めなければユーザーに確認）。

## 指摘から起票する
reviewer の指摘や `/work` の還元など、その場で直さない項目を issue にする。起票せずに PR 本文の「defer 理由」だけで済ませない。
1. 重複を確認する: `gh issue list --state open --search "<キーワード or file名>"`。近い issue があれば新規作成せず、その issue にコメントで追記する
2. 指摘ごとに 1 issue。ただし同じファイルの同種の指摘は 1 つにまとめてよい。まとめる単位は 1 PR で完遂できる範囲
3. type は reviewer が付けた type 候補（fix / refactor / test / docs / chore）を使い、無ければ指摘の内容から決める。優先度は既定で P3、実害のある不具合は P1〜P2
4. 本文の「背景」に指摘元（PR 番号またはブランチ名）と `file:line`、該当した観点（§ または ADR 番号）を書く。「検証」は、指摘が解消したと判定できる条件にする
5. 親 epic があれば本文冒頭に `Parent: #<epic>` を書く。`/work` から呼ばれた場合は、元の issue 番号を「背景」に書く
6. 作成した issue 番号を、呼び出し元（PR 本文の defer 理由、`/work` の報告）に返す

## 人間レビューを依頼する
reviewer の判定が「事後レビュー」「マージ保留」のとき、人間が見る観点を issue にする。type は `chore`、優先度は事後レビューなら P2、マージ保留なら P1。タイトルは `chore: PR #<番号> のレビュー依頼(<観点の要約>)`。「背景」に PR の URL、判定の理由、見てほしい観点(1〜3 個)を書き、「検証」は『観点ごとに問題なしと確認した、または修正 issue を起票した』にする。マージ保留の場合は、マージ可否を判断する旨を書く。起票したら呼び出し元は次の作業に進み、この issue の完了を待たない
