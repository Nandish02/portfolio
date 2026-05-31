#!/bin/zsh
# Every 15 min during Google's intern application window (Oct 15 – Nov 15).
# Only polls Google careers. Pings Discord when new postings appear.
cd "$(dirname "$0")/.." || exit 1
mkdir -p data/logs
[ -f .env ] && set -a && source .env && set +a

# Bail out if today is outside the Oct 15 – Nov 15 window
MONTH=$(date +%m)
DAY=$(date +%d)
IN_WINDOW=0
if [[ "$MONTH" == "10" && $DAY -ge 15 ]]; then IN_WINDOW=1; fi
if [[ "$MONTH" == "11" && $DAY -le 15 ]]; then IN_WINDOW=1; fi
if [[ "$IN_WINDOW" -ne 1 ]]; then
  exit 0
fi

exec /usr/local/bin/python3.12 -m jobs.pipeline google >> data/logs/google_window.log 2>&1
