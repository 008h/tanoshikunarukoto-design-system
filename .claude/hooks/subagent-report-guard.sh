#!/usr/bin/env bash
# SubagentStop: block a reviewer that stops without its final report.
# A final report contains the verdict section ("要否判定") with one of: 不要 / 事後レビュー / マージ保留.
# Other agent types pass. Fails open if the hook input cannot be parsed, and lets the
# subagent stop when this hook already blocked once (stop_hook_active).
set -uo pipefail

exec python3 -I -c '
import json, re, sys

GUARDED_AGENTS = {"reviewer"}
VERDICT = re.compile(r"要否判定")
VERDICT_VALUES = re.compile(r"(不要|事後レビュー|マージ保留)")

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

if data.get("stop_hook_active") or data.get("agent_type") not in GUARDED_AGENTS:
    sys.exit(0)

message = data.get("last_assistant_message") or ""
if VERDICT.search(message) and VERDICT_VALUES.search(message):
    sys.exit(0)

print(json.dumps({
    "decision": "block",
    "reason": "最終報告が揃っていません。待機中や途中経過で終わらず、いま取得できる結果で最終報告を返してください。"
              "最終報告には、指摘の一覧(違反が無ければ「準拠」)と「人間レビューの要否判定」(不要 / 事後レビュー / マージ保留)の両方を含めてください。"
              "バックグラウンド処理が残っていれば停止し、待たずにその旨を報告へ書いてください。",
}, ensure_ascii=False))
'
