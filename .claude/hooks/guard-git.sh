#!/usr/bin/env bash
# PreToolUse(Bash): block git commands that bypass review or rewrite shared history.
#   - the no-verify flag on any git command, and `git commit -n` (its short form)
#   - hook bypass through `git -c core.hooksPath=...`
#   - git push --force / -f / --force-with-lease / +refspec
#   - git push --delete / -d / :ref (deleting remote branches or tags)
#   - git push that targets main/master (explicit refspec, or the current branch when none is given)
#   - the same commands wrapped in `bash -c "..."`, `sh -c "..."` or `eval "..."`
# Fails open if the hook input cannot be parsed.
set -uo pipefail

exec python3 -I -c '
import json, re, shlex, subprocess, sys

PROTECTED = {"main", "master"}
FORCE = {"-f", "--force", "--force-with-lease", "--force-if-includes"}
NO_VERIFY = "--no-" + "verify"
SEPARATOR_CHARS = ";&|()`\n"
WRAPPED = re.compile(
    r"\b(?:(?:ba|z|da)?sh\s+(?:-\w+\s+)*-\w*c|eval)\s+(?:\"((?:[^\"\\]|\\.)*)\"|\x27([^\x27]*)\x27)"
)
MAX_DEPTH = 3


def block(msg):
    sys.stderr.write("BLOCK: " + msg + "\n")
    sys.exit(2)


def git(*args):
    try:
        return subprocess.run(["git", *args], capture_output=True, text=True, timeout=5).stdout.strip()
    except Exception:
        return ""


def protected_names():
    names = set(PROTECTED)
    head = git("symbolic-ref", "--short", "refs/remotes/origin/HEAD")
    if head.startswith("origin/"):
        names.add(head[len("origin/"):])
    return names


def git_subcommand(tokens):
    i = tokens.index("git") + 1
    while i < len(tokens):
        t = tokens[i]
        if t in ("-C", "--git-dir", "--work-tree", "--namespace"):
            i += 2
        elif t in ("-c", "--config-env"):
            if i + 1 < len(tokens) and "hookspath" in tokens[i + 1].lower():
                block("overriding core.hooksPath is not allowed.")
            i += 2
        elif t.startswith("-"):
            i += 1
        else:
            return t, tokens[i + 1:]
    return None, []


def check_commit(args):
    for a in args:
        if re.fullmatch(r"-[a-zA-Z]*n[a-zA-Z]*", a):
            block("git commit -n skips the hooks (same as the no-verify flag). Fix the underlying issue instead.")


def check_push(args, protected):
    if any(a in FORCE or a.startswith("--force-with-lease=") for a in args):
        block("force push is not allowed. Ask the user to run it themselves (! git push ...) if it is really needed.")
    if "--all" in args or "--mirror" in args:
        block("pushing all refs is not allowed.")
    if any(a == "--delete" or re.fullmatch(r"-[a-zA-Z]*d[a-zA-Z]*", a) for a in args):
        block("deleting remote refs is not allowed. Ask the user to run it themselves (! git push --delete ...).")
    positional = [a for a in args if not a.startswith("-")]
    refspecs = positional[1:]
    current = git("rev-parse", "--abbrev-ref", "HEAD")
    if not refspecs:
        if current in protected:
            block("you are on " + current + ". Do not push main directly: create a branch, push it and open a PR.")
        return
    for spec in refspecs:
        if spec.startswith("+"):
            block("force push (+refspec) is not allowed.")
        if spec.startswith(":"):
            block("deleting a remote ref (:ref) is not allowed. Ask the user to run it themselves.")
        dst = spec.split(":", 1)[-1]
        dst = dst[len("refs/heads/"):] if dst.startswith("refs/heads/") else dst
        if dst == "HEAD":
            dst = current
        if dst in protected:
            block("pushing to " + dst + " directly is not allowed. Push a branch and open a PR, then merge it through the PR once the gate and review pass.")


def split_segments(command):
    lexer = shlex.shlex(command, posix=True, punctuation_chars=SEPARATOR_CHARS)
    lexer.whitespace_split = True
    lexer.whitespace = " \t\r"
    segments, current = [], []
    for token in lexer:
        if set(token) <= set(SEPARATOR_CHARS):
            segments.append(current)
            current = []
        else:
            current.append(token)
    segments.append(current)
    return segments


def crude_check(command):
    # Unbalanced quotes: the command cannot be tokenized, so fail closed on obvious bypasses.
    if not re.search(r"\bgit\b", command):
        return
    if NO_VERIFY in command or re.search(r"hookspath", command, re.I):
        block("the command cannot be parsed and looks like a hook bypass.")
    if re.search(r"\bcommit\b[^\n]*\s-[a-zA-Z]*n[a-zA-Z]*\b", command):
        block("the command cannot be parsed and looks like git commit -n.")
    if re.search(r"\bpush\b[^\n]*(\s-f\b|--force|--delete|\s\+|\s:|\bmain\b|\bmaster\b)", command):
        block("the command cannot be parsed and looks like a force push or a push to main.")


def check_command(command, depth=0):
    if depth > MAX_DEPTH:
        return
    for match in WRAPPED.finditer(command):
        inner = match.group(1) if match.group(1) is not None else match.group(2)
        check_command(inner.replace("\\\"", "\""), depth + 1)
    protected = None
    try:
        segments = split_segments(command)
    except ValueError:
        crude_check(command)
        return
    for tokens in segments:
        if "git" not in tokens:
            continue
        if NO_VERIFY in tokens:
            block("the no-verify flag is not allowed. Fix the underlying issue instead.")
        sub, rest = git_subcommand(tokens)
        if sub == "commit":
            check_commit(rest)
        if sub == "push":
            protected = protected or protected_names()
            check_push(rest, protected)


try:
    command = json.load(sys.stdin)["tool_input"]["command"]
except Exception:
    sys.exit(0)

check_command(command)
sys.exit(0)
'
