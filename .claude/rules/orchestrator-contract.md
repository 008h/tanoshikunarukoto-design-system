<!-- managed by orchestrator (shared/rules/contract.md). Do not edit here; edit in orchestrator and re-run scripts/sync.sh -->
# 共有スキル/エージェントの契約(orchestrator 由来)

`.claude/skills|agents` の共有スキルとエージェントは、リポジトリ固有の情報を `docs/AGENT.md` の次の見出しから読む: `## Architecture` `## Gate` `## Test policy` `## Review checklist`(任意: `## Roadmap`)。

- **場所**: プロジェクトルートの `docs/AGENT.md`。無ければ、1 階層下の `*/docs/AGENT.md` が 1 つだけあればそれを使う(例: git ルートの下の `app/docs/AGENT.md`)
- **実行ディレクトリ**: `AGENT.md` に書かれたコマンドは、その `docs/` の親ディレクトリで実行する
- **ADR の場所**: `AGENT.md` に書かれていればそれ、無ければ `docs/DECISIONS.md`
- **ゲート**: `AGENT.md` の `## Gate` のコマンドを優先し、無ければ `package.json` の `gate` スクリプトを使う。どちらも無ければ停止して `AGENT.md` の整備を促す
- 共有ファイル(`.claude/` の `orchestrator-*`、`orchestrator.lock`、`hooks/block-no-verify.sh`、共有スキル/エージェント)は手編集しない。直すときは orchestrator の `shared/` を編集して同期する
