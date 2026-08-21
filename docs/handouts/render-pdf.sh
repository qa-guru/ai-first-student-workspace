#!/usr/bin/env bash
# HTML → PDF (A4 landscape). Requires Google Chrome.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$ROOT/pdf"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

if [[ ! -x "$CHROME" ]]; then
  echo "Chrome not found: $CHROME" >&2
  exit 1
fi

mkdir -p "$OUT"

sheets=(
  00-overview
  01-skills
  02-rules
  03-rag
  04-adr
  20-login
  21-login-skill
  22-login-rule
  23-login-rag
  24-login-adr
  30-login-micro
  31-login-full
  32-login-minus-one
  33-login-pairs
  34-login-singles
  35-login-context
  10-stack-skills
  11-stack-skills-rules
  12-stack-skills-rules-rag
  13-stack-skills-rules-rag-adr
  40-homework
)

for id in "${sheets[@]}"; do
  src="$ROOT/${id}.html"
  dst="$OUT/${id}.pdf"
  echo "→ $id"
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --no-pdf-header-footer \
    --hide-scrollbars \
    --virtual-time-budget=8000 \
    --print-to-pdf="$dst" \
    "file://${src}"
done

echo "OK $OUT"
ls -lh "$OUT"
