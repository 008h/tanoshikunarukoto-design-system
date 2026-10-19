---
name: work
description: GitHub issue 番号を受けて、ブランチ作成 → TDD 実装 → ゲート → reviewer サブエージェントレビュー → atomic commit → PR 作成までを一気通貫で実行する。使い方 /work <issue番号>
argument-hint: "<issue number>"
---
<!-- managed by orchestrator (shared/skills/work/SKILL.md). Do not edit here; edit in orchestrator and re-run scripts/sync.sh -->

# issue を PR まで完遂する

1回の呼び出しで **issue 1件 = PR 1件**。規約の詳細は `docs/WORKFLOW.md`（無ければ以下の既定値）。

## 1. issue 確認
- `gh issue view $ARGUMENTS` で本文・ラベルを読む。`docs/ROADMAP.md` があればタスクIDと依存タスクの状態も確認する
- **停止条件**: type ラベルが無い / 検証条件が書かれていない → `/issue` で先に整形する（意図が不明ならユーザーに確認して停止）
- **停止条件**: 依存タスクが未完了 → 確認して停止
- 1 PR で完遂できない粒度なら、実装せず epic + 子 issue への分割を提案して停止

## 2. ブランチ作成
- `git status` で working tree を確認。無関係な未コミット変更があれば stash せずユーザーに確認
- 必ず `origin/main` を base にする: `git fetch origin main && git checkout -b <type>/<n>-<slug> origin/main`
- 作成直後に `git log --oneline origin/main..HEAD` が空であることを確認してから実装に入る

## 3. TDD 実装
- `docs/AGENT.md` の `## Test policy` の TDD 対象は RED → GREEN → REFACTOR。RED は `test-writer` に委任できる
- 既存ユーティリティを `## Architecture` で確認してから書く
- `docs/DECISIONS.md` に無い設計判断が必要になったら、`/adr` で ADR を書いて停止する
- issue の「作業内容」のチェックボックスを上から消化する

## 4. ゲート
- `/gate` の手順で通す。**停止条件**: 同じ原因で3回失敗 → issue にコメントして停止

UI・挙動に触れた変更なら、コミットの前に `/verify` で実ブラウザの動作確認まで行う。結果は PR の Test plan に書く。

## 5. コミット
- atomic に分割、Conventional Commits（英語）、type は issue と一致させる。`--no-verify` 禁止

## 6. レビュー
- `reviewer` エージェントを起動し `git diff origin/main...HEAD` をレビューさせる（ローカル `main` ではなく `origin/main`）。起動の依頼文には、対象の issue と変更の要点、最終報告に「指摘の一覧」と「人間レビューの要否判定」を含めること、バックグラウンド実行をしないことを書く(サブエージェントは親の会話を引き継がない)
- `docs/AGENT.md` の `## Review checklist` に「パス別の追加エージェント」があれば、差分が該当パスに触れている場合に併せて起動する
- reviewer が返す「人間レビューの要否判定」(不要 / 事後レビュー / マージ保留)を控える。
- reviewer の返答に、指摘の一覧(または「準拠」)と要否判定の両方が揃うまで先へ進まない。途中経過(待機中、バックグラウンド作業中)の返答や、判定が抜けた返答は未完了として扱い、`SendMessage` で最終報告の提出を求める。それでも届かなければ reviewer を起動し直す。報告が無いまま PR を作らない
- 完了の待機には、通知か返信を使う。エージェントの出力ファイルの文字列検索は、依頼文も含むため誤検知する
- 指摘は修正して再ゲート+再コミットする。この PR で直さない指摘は、`/issue` の「指摘から起票する」で issue にし、PR 本文に `#<番号>` と defer 理由を書く。黙殺しない

## 7. PR 作成
- `git push -u origin <branch>` → `gh pr create`。本文は Summary / Test plan /（あれば）defer した指摘の issue 番号と理由
- 本文が日本語なら、`/yomiyasu` の手順で推敲し、本文をファイルに書いて `yomiyasu_lint.py` の検出を確かめてから `--body-file` で渡す
- PR を作成したら、ゲートとレビューが通っていることを確認して、**ユーザーに確認せずマージする**(`shared/rules/git-workflow.md` の方式とマージしない条件に従う)。人間レビューの要否判定に応じて次のように動き、**どの場合も開発は止めず、次の作業に進む**
  - 不要: そのままマージする
  - 事後レビュー: マージし、`/issue` の「人間レビューを依頼する」で issue にする
  - マージ保留: マージせず PR を開いたまま残し、同じく issue にするマージ後は issue をクローズし(本文に `Closes` は書かないため手動)、ローカルの `main` を `origin/main` に追従させる

## 8. 還元
- 実装中に見つけた改善点を doc / skill / BACKLOG / issue / ADR のいずれかに落とす。省略しない。issue にする場合は `/issue` の「指摘から起票する」に従う

## 報告
完了時: issue 番号 / ブランチ / コミット一覧 / ゲート結果 / レビュー指摘と対応 / PR URL / 還元した改善点。停止時: 該当した停止条件と必要な判断。
