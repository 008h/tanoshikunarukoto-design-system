<!-- managed by orchestrator (shared/rules/git-workflow.md). Do not edit here; edit in orchestrator and re-run scripts/sync.sh -->
# Git 運用ルール(orchestrator 由来・全リポジトリ共通)

## 基本フロー
- **`main`(デフォルトブランチ)へ直接 push しない。** ブランチ → push → PR → ゲート・レビュー通過 → マージ。小さな変更(記事の追加、設定の修正)でも同じ
- ブランチは最新の `origin/main` から切る(`git fetch origin main && git checkout -b <type>/<slug> origin/main`)。名前は `<type>/<slug>`(type は Conventional Commits の prefix、slug は英小文字ケバブケース)。issue がある場合のみ `<type>/<issue番号>-<slug>`
- ゲートとレビューが通った PR は、**ユーザーに確認せずマージしてよい**。方式はそのリポジトリの `docs/AGENT.md` / `docs/WORKFLOW.md` に従い、書かれていなければ rebase merge。マージ後はブランチを削除し、ローカルの `main` を `origin/main` に追従させる
  - マージしない場合: ゲートが落ちている、レビュー指摘が未対応(起票も修正もしていない)、reviewer が「マージ保留」と判定した(PR を残して issue にし、次の作業へ進む)、CI が失敗している
  - 人間のレビューが要ると reviewer が判定したものは issue にし、開発は止めない(事後レビューはマージしてから、マージ保留はマージせずに起票する)
  - 対象は自分が作った PR のみ。他人の PR や、依頼と無関係な PR はマージしない
- PR 本文は Summary と Test plan。issue があれば紐づけてよいが、必須ではない

## コミット
- Conventional Commits(`feat:` `fix:` `refactor:` `docs:` `test:` `chore:` `perf:` `ci:`)、英語、1 つの論理的変更 = 1 コミット
- `--no-verify` は使わない。フックやテストが落ちたら原因を直す
- `main` の上でコミットしてしまった場合は、`git switch -c <branch>` で新しいブランチに移してから、`main` を `origin/main` に戻す(戻す前に内容を確認する)

## force push
- 使わない。本当に必要な場合は、ユーザーが自分で実行する(`! git push --force-with-lease ...`)

## 強制の仕組み
- 共有フック `.claude/hooks/guard-git.sh`(PreToolUse)が、`--no-verify`、force push、`main` への push を止める。ブロックされたら回避せず、ブランチと PR に切り替える
- GitHub のブランチ保護は、**private リポジトリの Free プランでは使えない**(API が 403 "Upgrade to GitHub Pro or make this repository public")。使える場合(public か Pro)は、そのリポジトリで最初に PR を作る前に一度だけ `gh api repos/<owner>/<repo>/branches/<default>/protection` で確認する
  - 403 でプラン制限なら、何も報告せず、フックに頼る
  - 使えるのに保護が無ければ、推奨設定(PR 必須、force push と削除の禁止、管理者にも適用)をユーザーに提案する。**承認なしに GitHub の設定を変更しない**
