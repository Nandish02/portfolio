#!/bin/zsh
# Daily 6 AM full run: all collectors, dedupe, filter, AI-score top-N, export xlsx + Sheets.
cd "$(dirname "$0")/.." || exit 1
mkdir -p data/logs
[ -f .env ] && set -a && source .env && set +a
exec /usr/local/bin/python3.12 -m jobs.pipeline full >> data/logs/full.log 2>&1
