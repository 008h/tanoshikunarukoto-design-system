<!-- managed by orchestrator (shared/rules/coding.md). Do not edit here; edit in orchestrator and re-run scripts/sync.sh -->
# Global Claude Code Guidelines

## Code Style

- Immutability優先: オブジェクトや配列を直接変更せず、常に新しいコピーを作成する
- 1ファイル 200-400行を目安、最大でも800行以内に保つ
- 関数は50行以内、ネストは4段階まで
- ハードコードした値は避け、定数や設定に外出しする
- 不要なコメントやdocstringは追加しない。コードで意図が伝わるなら書かない

## Git Workflow

- Conventional Commits形式: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, `ci:`
- コミットはatomicに（1つの論理的変更 = 1コミット）
- `--no-verify` は絶対に使わない
- force pushは本人の明示的指示がない限り行わない

## Security

- シークレット（APIキー、トークン等）を絶対にコードにハードコードしない
- `.env` ファイルをコミットしない
- ユーザー入力は必ずバリデーションする（XSS, SQLi, コマンドインジェクション対策）

## Testing

- テストがある場合はTDD: RED -> GREEN -> REFACTOR
- 型チェック（TypeScript strict mode）を常に通す

## Error Handling

- エラーは握りつぶさず、適切にハンドリングする
- ユーザーに見せるエラーメッセージには内部情報を含めない

## Language

- ユーザーとの会話は日本語で行う
- コード内のコメントとコミットメッセージは日本語。変数名・関数名などの識別子は英語
- Conventional Commits の `type:` は英語のまま、後ろの説明を日本語にする(例: `feat: ログイン画面を追加`)
