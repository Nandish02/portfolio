#!/bin/zsh
# One-command entry point.
#
# Usage:
#   ./jobs.sh setup --install-deps
#   ./jobs.sh doctor
#   ./jobs.sh run --open
#   ./jobs.sh quick
#   ./jobs.sh install
HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE" || exit 1

# Pick Python — prefer an explicit, full system Python 3.12 over any partially-
# active venv that might be missing deps.
PY=""
for cand in \
    "$HERE/.venv/bin/python3" \
    "/usr/local/bin/python3.12" \
    "/opt/homebrew/bin/python3.12" \
    "/usr/bin/python3" \
    "$(command -v python3.12)" \
    "$(command -v python3)"
do
    if [ -x "$cand" ]; then
        if "$cand" -c "import pydantic, httpx, yaml" 2>/dev/null; then
            PY="$cand"
            break
        fi
    fi
done

if [ -z "$PY" ]; then
    echo "Could not find a Python 3 with required deps (pydantic, httpx, pyyaml)."
    echo "Run:  python3 -m pip install -r requirements.txt"
    exit 1
fi

exec "$PY" -m jobs "$@"
