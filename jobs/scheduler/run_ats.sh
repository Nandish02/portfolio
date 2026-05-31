#!/bin/zsh
# Hourly ATS-only polling. Lightweight: no AI scoring, no exports.
# Logs to ./data/logs/ats.log
cd "$(dirname "$0")/.." || exit 1
mkdir -p data/logs
[ -f .env ] && set -a && source .env && set +a
exec /usr/local/bin/python3.12 -m jobs.pipeline ats >> data/logs/ats.log 2>&1
