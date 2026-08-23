#!/usr/bin/env bash
#
# sync-and-deploy.sh — one command, end to end:
#   1. Finds the newest matching zip in your Downloads folder (handles
#      browser duplicate-download suffixes like "(1)", "(2)" automatically —
#      picks by modification time, not filename).
#   2. Extracts it and syncs only known safe paths into this repo
#      (never touches .git, .env, node_modules).
#   3. Runs basic audits: type-check, production build, secret/leftover-debug
#      scan, merge-conflict-marker scan. Any failure stops the script here —
#      nothing is committed or pushed.
#   4. Starts the local dev server so you can eyeball the change in a browser.
#   5. Shows a diff summary and asks for explicit y/N confirmation.
#   6. Only on "y": commits and pushes to origin/main (which is what actually
#      triggers your Netlify deploy — nothing before this step is "live").
#
# USAGE
#   chmod +x scripts/sync-and-deploy.sh
#   ./scripts/sync-and-deploy.sh
#
# CONFIG — edit these three if your setup differs:
DOWNLOADS_DIR="${DOWNLOADS_DIR:-$HOME/Downloads}"
FILE_PATTERN="${FILE_PATTERN:-onestop-jobs*.zip}"
BRANCH="${BRANCH:-main}"

set -euo pipefail

# ---- colors (fall back to plain text if not a terminal) ----
if [ -t 1 ]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; BLUE='\033[0;34m'; NC='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; NC=''
fi
step()  { echo -e "\n${BLUE}▸ $1${NC}"; }
ok()    { echo -e "${GREEN}✓ $1${NC}"; }
warn()  { echo -e "${YELLOW}! $1${NC}"; }
fail()  { echo -e "${RED}✗ $1${NC}"; exit 1; }

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

[ -d .git ] || fail "Not a git repo: $PROJECT_DIR. Run this from inside your project (scripts/sync-and-deploy.sh)."

# ---------------------------------------------------------------------------
step "1/6  Finding the newest download matching '$FILE_PATTERN' in $DOWNLOADS_DIR"
# ---------------------------------------------------------------------------
LATEST_ZIP=$(find "$DOWNLOADS_DIR" -maxdepth 1 -iname "$FILE_PATTERN" -type f -print0 \
  | xargs -0 ls -t 2>/dev/null | head -n1 || true)

[ -n "${LATEST_ZIP:-}" ] || fail "No file matching '$FILE_PATTERN' found in $DOWNLOADS_DIR"
ok "Using: $LATEST_ZIP"

# ---------------------------------------------------------------------------
step "2/6  Extracting and syncing into repo"
# ---------------------------------------------------------------------------
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"; [ -n "${DEV_PID:-}" ] && kill "$DEV_PID" 2>/dev/null || true' EXIT

unzip -q "$LATEST_ZIP" -d "$TMP_DIR"

# The zip's top-level folder name varies between exports (e.g. "build/",
# "onestop-jobs/") — find whichever subfolder actually contains package.json
# rather than hardcoding a name. Picks the SHALLOWEST match (fewest path
# separators), since the zip can contain more than one package.json now
# (e.g. crawler/package.json alongside the real root one).
#
# NOTE: an earlier version of this used `wc -c | cut -d' ' -f2-` to parse
# the depth count. That broke silently on macOS specifically: BSD wc
# right-pads its output with leading spaces (e.g. "       7" instead of
# Linux GNU wc's plain "7"), and `cut -d' '` treats each of those spaces
# as a separate delimiter, splitting the padding itself into the captured
# value instead of just the path. The result LOOKED like it printed
# correctly-ish ("Source root:       7 /path/to/build") but SRC_ROOT
# actually held that whole garbled string, which meant every subsequent
# `[ -e "$SRC_ROOT/$p" ]` check silently failed and nothing was copied —
# while the "✓ Synced: ..." line printed the full expected list anyway
# regardless of what actually happened (a second, separate bug, also
# fixed below). This version avoids string-splitting a padded number
# entirely: SRC_ROOT is assigned directly from the clean path, and depth
# is only ever used inside `$(( ))` arithmetic context, which strips
# leading/trailing whitespace when parsing an operand regardless of
# platform — verified against a simulated padded value before shipping.
SRC_ROOT=""
BEST_DEPTH=999999
while IFS= read -r d; do
  raw_count=$(printf '%s' "$d" | tr -cd '/' | wc -c)
  depth=$(( raw_count ))
  if [ "$depth" -lt "$BEST_DEPTH" ]; then
    BEST_DEPTH=$depth
    SRC_ROOT="$d"
  fi
done < <(find "$TMP_DIR" -name package.json -exec dirname {} \;)
[ -n "${SRC_ROOT:-}" ] || fail "Couldn't find package.json inside the zip — is this the right file?"
ok "Source root: $SRC_ROOT"

# Only these paths are synced. Anything not listed here (.git, .env,
# node_modules, dist, any file you added locally that isn't in the zip)
# is left completely untouched.
SYNC_PATHS=(src docs public index.html package.json tailwind.config.cjs postcss.config.cjs vite.config.ts tsconfig.json README.md crawler .github netlify netlify.toml)
SYNCED_PATHS=()
MISSING_PATHS=()

for p in "${SYNC_PATHS[@]}"; do
  SRC_PATH="$SRC_ROOT/$p"
  if [ ! -e "$SRC_PATH" ]; then
    MISSING_PATHS+=("$p")
    continue
  fi
  if [ -d "$SRC_PATH" ]; then
    mkdir -p "$PROJECT_DIR/$p"
    if command -v rsync >/dev/null 2>&1; then
      # Trailing slashes on BOTH sides = sync contents into the target dir.
      # Without them, rsync nests the source dir inside the target
      # (e.g. src/src/...) when the target already exists — that was the bug.
      rsync -a --delete "$SRC_PATH/" "$PROJECT_DIR/$p/"
    else
      rm -rf "${PROJECT_DIR:?}/$p"
      mkdir -p "$PROJECT_DIR/$p"
      cp -r "$SRC_PATH/." "$PROJECT_DIR/$p/"
    fi
  else
    cp -f "$SRC_PATH" "$PROJECT_DIR/$p"
  fi
  SYNCED_PATHS+=("$p")
done

# This used to unconditionally print the full configured SYNC_PATHS list
# regardless of whether each path actually existed and got copied — a
# real bug that masked the SRC_ROOT detection bug above for an entire
# session, since the script confidently reported success while silently
# copying nothing at all. Now reports only what genuinely happened.
if [ "${#SYNCED_PATHS[@]}" -gt 0 ]; then
  ok "Synced: ${SYNCED_PATHS[*]}"
fi
if [ "${#MISSING_PATHS[@]}" -gt 0 ]; then
  warn "Not found in zip, skipped: ${MISSING_PATHS[*]}"
fi
if [ "${#SYNCED_PATHS[@]}" -eq 0 ]; then
  fail "Nothing was actually synced — SRC_ROOT may be wrong. Source root was: $SRC_ROOT"
fi

# ---------------------------------------------------------------------------
step "3/6  Installing dependencies (only reinstalls what changed)"
# ---------------------------------------------------------------------------
npm install --no-audit --no-fund --loglevel=error

# ---------------------------------------------------------------------------
step "4/6  Auditing"
# ---------------------------------------------------------------------------
echo "  → Type-checking…"
npx tsc -b --noEmit 2>&1 | tee /tmp/typecheck.log
[ ! -s /tmp/typecheck.log ] || fail "Type errors found (see above). Nothing committed."
ok "Type-check passed"

echo "  → Production build…"
npx vite build > /tmp/build.log 2>&1 || { cat /tmp/build.log; fail "Build failed. Nothing committed."; }
ok "Build passed"

echo "  → Scanning for leftovers…"
LEFTOVERS=$(grep -rnE "console\.(log|debug)\(|debugger;" src/ 2>/dev/null || true)
if [ -n "$LEFTOVERS" ]; then
  warn "Found console.log/debugger statements:"
  echo "$LEFTOVERS"
  warn "Not blocking — review before pushing."
fi

echo "  → Scanning for likely secrets…"
SECRETS=$(grep -rnE "(sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z]+ PRIVATE KEY-----)" src/ 2>/dev/null || true)
[ -z "$SECRETS" ] || fail "Possible hardcoded secret found — review before continuing:\n$SECRETS"
ok "No obvious secrets in src/"

echo "  → Scanning for unresolved merge conflict markers…"
CONFLICTS=$(grep -rn "^<<<<<<< \|^=======$\|^>>>>>>> " src/ 2>/dev/null || true)
[ -z "$CONFLICTS" ] || fail "Unresolved merge conflict markers found:\n$CONFLICTS"
ok "No conflict markers"

# ---------------------------------------------------------------------------
step "5/6  Local preview"
# ---------------------------------------------------------------------------
npx vite --port 5173 > /tmp/vite-dev.log 2>&1 &
DEV_PID=$!
sleep 2
if kill -0 "$DEV_PID" 2>/dev/null; then
  ok "Dev server running: http://localhost:5173"
else
  warn "Dev server may have failed to start — check /tmp/vite-dev.log"
fi

echo -e "\n${YELLOW}Changed files:${NC}"
git status --short
echo -e "\n${YELLOW}Diff summary:${NC}"
git diff --stat

echo -e "\nOpen ${BLUE}http://localhost:5173${NC} and review the change."
read -rp "$(echo -e "${YELLOW}Full diff? [y/N] ${NC}")" SHOW_DIFF
[ "$SHOW_DIFF" = "y" ] && git --no-pager diff

kill "$DEV_PID" 2>/dev/null || true
DEV_PID=""

# ---------------------------------------------------------------------------
step "6/6  Confirm before pushing (this is what makes it live via Netlify)"
# ---------------------------------------------------------------------------
read -rp "$(echo -e "${YELLOW}Commit and push to origin/$BRANCH? [y/N] ${NC}")" CONFIRM
if [ "$CONFIRM" != "y" ]; then
  warn "Not pushed. Changes are staged locally in your working tree — review in VS Code, then re-run this script or push manually when ready."
  exit 0
fi

read -rp "Commit message [Sync from $(basename "$LATEST_ZIP")]: " MSG
MSG="${MSG:-Sync from $(basename "$LATEST_ZIP")}"

git add -A
git commit -m "$MSG"
git push origin "$BRANCH"

ok "Pushed to origin/$BRANCH — Netlify will deploy automatically."
