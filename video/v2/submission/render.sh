#!/usr/bin/env bash
# Render an HTML file to a PNG via agent-browser (same path captions.mjs uses).
# usage: render.sh <input.html> <output.png> [width] [height]
set -euo pipefail

IN="$1"; OUT="$2"; W="${3:-1920}"; H="${4:-1080}"
AB="${AB:-/Users/nekobiteandthem1/.npm-global/bin/agent-browser}"

ABS_IN="$(cd "$(dirname "$IN")" && pwd)/$(basename "$IN")"
mkdir -p "$(dirname "$OUT")"

$AB set viewport "$W" "$H" >/dev/null 2>&1 || true
$AB open "file://${ABS_IN}" >/dev/null 2>&1
$AB wait 1800 >/dev/null 2>&1
$AB screenshot "$OUT" >/dev/null 2>&1
$AB close >/dev/null 2>&1 || true

if [ ! -s "$OUT" ]; then
  echo "RENDER FAILED: $OUT not created" >&2
  exit 1
fi
echo "rendered $OUT  $(sips -g pixelWidth -g pixelHeight "$OUT" | awk '/pixel/{printf "%s ", $2}')"
