#!/usr/bin/env bash
# Stop: block a turn that ends with this session's edits uncommitted, or with code edited
# after the last gate run. Reads the session transcript for Edit/Write/Bash/Skill calls.
# The gate command comes from the first inline code of the "## Gate" line in docs/AGENT.md
# (falling back to a package.json "gate" script); without one, only the uncommitted check runs.
# A final message that ends in a question passes. Fails open if the input cannot be parsed,
# and lets the turn end when this hook already blocked once (stop_hook_active).
set -uo pipefail

exec python3 -I -c '
import glob, json, os, re, subprocess, sys

EDIT_TOOLS = {"Edit": "file_path", "Write": "file_path", "MultiEdit": "file_path", "NotebookEdit": "notebook_path"}
DOC_SUFFIXES = (".md",)
INLINE_CODE = re.compile(r"`([^`]+)`")
GIT_TIMEOUT = 10

def load_events(path):
    events = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            try:
                events.append(json.loads(line))
            except ValueError:
                continue
    return events

def tool_calls(events):
    for event in events:
        content = (event.get("message") or {}).get("content")
        if event.get("type") != "assistant" or not isinstance(content, list):
            continue
        for block in content:
            if isinstance(block, dict) and block.get("type") == "tool_use":
                yield block.get("name", ""), block.get("input") or {}

def git(root, *args):
    result = subprocess.run(["git", "-C", root, *args], capture_output=True, text=True, timeout=GIT_TIMEOUT)
    return result.stdout if result.returncode == 0 else None

def gate_needles(root):
    candidates = [os.path.join(root, "docs", "AGENT.md")] + sorted(glob.glob(os.path.join(root, "*", "docs", "AGENT.md")))
    for path in candidates:
        if not os.path.isfile(path):
            continue
        with open(path, encoding="utf-8") as f:
            text = f.read()
        match = re.search(r"^## Gate\s*\n(.*?)(?=^## |\Z)", text, re.S | re.M)
        if not match:
            continue
        for line in match.group(1).splitlines():
            head = re.split(r"[(（]", line, maxsplit=1)[0]
            codes = INLINE_CODE.findall(head)
            if codes:
                return {part.strip() for code in codes for part in code.split("&&")[-1:]}
    package = os.path.join(root, "package.json")
    if os.path.isfile(package):
        try:
            with open(package, encoding="utf-8") as f:
                if "gate" in (json.load(f).get("scripts") or {}):
                    return {"pnpm gate"}
        except ValueError:
            pass
    return set()

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

if data.get("stop_hook_active"):
    sys.exit(0)

message = (data.get("last_assistant_message") or "").strip()
if message.endswith(("？", "?")):
    sys.exit(0)

try:
    transcript = data["transcript_path"]
    root = (git(data.get("cwd") or ".", "rev-parse", "--show-toplevel") or "").strip()
    if not root:
        sys.exit(0)
    root = os.path.realpath(root)
    calls = list(tool_calls(load_events(transcript)))
except Exception:
    sys.exit(0)

edits = []
for index, (name, tool_input) in enumerate(calls):
    key = EDIT_TOOLS.get(name)
    target = tool_input.get(key) if key else None
    if not target:
        continue
    resolved = os.path.realpath(os.path.join(data.get("cwd") or root, target))
    if resolved == root or resolved.startswith(root + os.sep):
        edits.append((index, os.path.relpath(resolved, root)))

if not edits:
    sys.exit(0)

reasons = []
status = git(root, "status", "--porcelain", "--", *sorted({path for _, path in edits}))
if status and status.strip():
    reasons.append("このセッションで編集したファイルが未コミットのまま残っています")

code_edits = [(i, p) for i, p in edits if not p.endswith(DOC_SUFFIXES)]
needles = gate_needles(root) if code_edits else set()
if needles:
    last_edit = max(i for i, _ in code_edits)
    ran_gate = False
    for index, (name, tool_input) in enumerate(calls):
        if index <= last_edit:
            continue
        if name == "Skill" and tool_input.get("skill") == "gate":
            ran_gate = True
        command = tool_input.get("command") if name == "Bash" else None
        if command and any(needle in command for needle in needles):
            ran_gate = True
    if not ran_gate:
        reasons.append("コードを編集したあと、ゲート(" + " / ".join(sorted(needles)) + ")を実行していません")

if reasons:
    print(json.dumps({
        "decision": "block",
        "reason": "。".join(reasons) + "。ゲートを通してコミットしてから終わってください。意図的に残す場合は、最終返答にその理由を書けば次の停止で終われます。",
    }, ensure_ascii=False))
'
