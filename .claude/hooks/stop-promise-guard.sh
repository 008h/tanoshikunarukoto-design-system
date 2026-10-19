#!/usr/bin/env bash
# Stop: block a turn that ends by announcing work it did not do ("続けて #48 から進めます").
# Looks only at the last paragraph of the final message. A trailing question or an explicit
# request for the user's input is allowed. Fails open if the hook input cannot be parsed,
# and lets the turn end when this hook already blocked once (stop_hook_active).
set -uo pipefail

exec python3 -I -c '
import json, re, sys

ANNOUNCE_JA = re.compile(
    r"(続けて|引き続き|次は|次に|このまま|これから|すぐに)[^。\n]{0,60}"
    r"(進めます|進めていきます|着手します|取り掛かります|取りかかります|取り組みます|実装します|対応します|作業します)"
)
ANNOUNCE_EN = re.compile(
    r"(?i)\b(i\x27ll|i will|let me|next,? i\x27ll)\s+(now\s+)?(continue|proceed|start|begin|move on|work on|go on)\b"
)
ASKS_USER = re.compile(r"(お知らせください|指示してください|教えてください|ご確認ください|判断をお願い|どうしますか|いかがでしょう)")
TAIL_CHARS = 400

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

if data.get("stop_hook_active"):
    sys.exit(0)

message = (data.get("last_assistant_message") or "").strip()
paragraphs = [p for p in re.split(r"\n\s*\n", message) if p.strip()]
tail = (paragraphs[-1] if paragraphs else "")[-TAIL_CHARS:]
if not tail or tail.rstrip().endswith(("？", "?")) or ASKS_USER.search(tail):
    sys.exit(0)

if ANNOUNCE_JA.search(tail) or ANNOUNCE_EN.search(tail):
    print(json.dumps({
        "decision": "block",
        "reason": "You announced upcoming work and ended the turn. Do not stop: run the announced step now with tools. "
                  "End the turn only when the work is done, or when you must ask the user a concrete question.",
    }, ensure_ascii=False))
'
