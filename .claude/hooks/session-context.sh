#!/usr/bin/env bash
# SessionStart (compact|resume): re-inject the working state so the session continues instead of
# asking the user again: branch, uncommitted files, the branch's PR, the open checklist of the
# issue named in the branch (<type>/<n>-slug), and the top of docs/BACKLOG.md ## High.
# Every lookup is best-effort: a failure leaves that line out. Output is capped.
set -uo pipefail

exec python3 -I -c '
import json, os, re, subprocess, sys

LOOKUP_TIMEOUT = 5
MAX_CHARS = 2000
BACKLOG_ITEMS = 3

def run(*cmd, cwd):
    try:
        result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=LOOKUP_TIMEOUT)
    except Exception:
        return None
    return result.stdout.strip() if result.returncode == 0 else None

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

cwd = data.get("cwd") or os.getcwd()
root = run("git", "rev-parse", "--show-toplevel", cwd=cwd)
if not root:
    sys.exit(0)

lines = []
branch = run("git", "branch", "--show-current", cwd=root) or ""
if branch:
    lines.append("ブランチ: " + branch)
dirty = run("git", "status", "--porcelain", cwd=root)
if dirty:
    lines.append("未コミットのファイル: %d 件" % len(dirty.splitlines()))

pr = run("gh", "pr", "view", "--json", "number,title,url,state", cwd=root)
if pr:
    try:
        info = json.loads(pr)
        lines.append("PR #%s (%s): %s %s" % (info["number"], info["state"], info["title"], info["url"]))
    except (ValueError, KeyError):
        pass

issue = re.match(r"^[a-z]+/(\d+)-", branch)
if issue:
    body = run("gh", "issue", "view", issue.group(1), "--json", "body", "--jq", ".body", cwd=root)
    open_items = [l.strip() for l in (body or "").splitlines() if l.strip().startswith("- [ ]")]
    if open_items:
        lines.append("issue #%s の未完了項目:" % issue.group(1))
        lines.extend("  " + item for item in open_items)

backlog = os.path.join(root, "docs", "BACKLOG.md")
if os.path.isfile(backlog):
    with open(backlog, encoding="utf-8") as f:
        text = f.read()
    high = re.search(r"^## High\s*\n(.*?)(?=^## |\Z)", text, re.S | re.M)
    items = [l.strip() for l in (high.group(1) if high else "").splitlines() if l.strip().startswith("- [ ]")]
    if items:
        lines.append("BACKLOG High の先頭:")
        lines.extend("  " + item for item in items[:BACKLOG_ITEMS])

if not lines:
    sys.exit(0)

lines.append("session-discipline に従い、残りのチェックリストを続けること。ユーザーに聞き直さない。")
context = "\n".join(lines)[:MAX_CHARS]
print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": context}}, ensure_ascii=False))
'
