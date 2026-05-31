"""Single-command CLI for the internship pipeline.

Usage:
  python3 -m jobs <command> [flags]

Commands:
  setup           First-time setup: creates .env, data/ dirs, installs deps if --install-deps.
  doctor          Health-check: prints which API keys are detected, which collectors will run,
                  which optional integrations are configured.
  run             Full pipeline: collect + dedupe + filter + AI-score + xlsx + Sheets export.
  quick           ATS-only collect; no AI, no exports. (Default cadence: hourly.)
  google          Google careers-only poll (used during Oct/Nov window).
  open            Open the latest xlsx export in the default app.
  install         Install launchd schedulers (hourly + daily + google-window).
  uninstall       Remove launchd schedulers.
  models          List models available for the currently-selected scorer (if supported).

Flags (apply to `run` / `quick`):
  --top N              Cap AI scoring to top N candidates this run.
  --scorer NAME        Force scorer: auto | claude_api | openai_api | gemini_api | github_models | bedrock | none
  --no-ai              Shortcut for --scorer=none.
  --rescore            Re-score even jobs scored recently (sets RESCORE_AFTER_DAYS=0).
  --open               Open the resulting xlsx when done.
  --log-level LEVEL    DEBUG | INFO | WARNING (default INFO).
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def _load_dotenv() -> None:
    try:
        from dotenv import load_dotenv  # type: ignore
        env = ROOT / ".env"
        if env.exists():
            load_dotenv(env, override=False)
    except ImportError:
        pass


def cmd_setup(args) -> int:
    env = ROOT / ".env"
    if not env.exists():
        shutil.copyfile(ROOT / ".env.example", env)
        print(f"created .env at {env} — edit it and add your API key(s).")
    else:
        print(f".env already exists at {env}; not overwriting.")

    for sub in ("data", "data/exports", "data/snapshots", "data/logs"):
        (ROOT / sub).mkdir(parents=True, exist_ok=True)

    if args.install_deps:
        print("installing python deps from requirements.txt ...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(ROOT / "requirements.txt")])

    print()
    print("next steps:")
    print(f"  1. open  {env}  and set ONE of: ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY")
    print("  2. run:  python3 -m jobs doctor          # verify everything is wired")
    print("  3. run:  python3 -m jobs run             # full pipeline")
    print("  4. run:  python3 -m jobs install         # enable hourly + daily auto-runs")
    return 0


def cmd_doctor(args) -> int:
    _load_dotenv()
    print("Internship pipeline doctor")
    print("=" * 60)

    # 1. AI scorer
    from .scorers import _auto_pick  # noqa: PLC2701
    selected = (os.environ.get("JOB_SCORER") or "auto").lower()
    print(f"JOB_SCORER       : {selected}")
    auto_pick = _auto_pick()
    print(f"auto-detected    : {auto_pick}")
    for key, label in [
        ("ANTHROPIC_API_KEY", "Claude (Anthropic)"),
        ("OPENAI_API_KEY",   "ChatGPT (OpenAI)"),
        ("GEMINI_API_KEY",   "Gemini (Google)"),
        ("GITHUB_TOKEN",     "GitHub Models"),
        ("AWS_ACCESS_KEY_ID","AWS Bedrock"),
    ]:
        v = os.environ.get(key)
        mark = "✓" if v else "✗"
        masked = (v[:6] + "..." + v[-4:]) if v and len(v) > 12 else (v or "")
        print(f"  [{mark}] {label:24s} {key:22s} {masked}")
    print()

    # 2. Output destinations
    print("Outputs")
    print(f"  XLSX export      : data/exports/   (always on)")
    sa = os.environ.get("GOOGLE_SHEETS_SA_JSON")
    print(f"  Google Sheets    : {'✓ ' + sa if sa else '✗ GOOGLE_SHEETS_SA_JSON not set'}")
    sid = os.environ.get("GOOGLE_SHEETS_ID")
    print(f"  Sheet ID         : {sid or '(auto-create)'}")
    dw = os.environ.get("DISCORD_WEBHOOK_URL")
    print(f"  Discord webhook  : {'✓' if dw else '✗ (optional)'}")
    print()

    # 3. Source toggles
    import yaml
    prefs = yaml.safe_load((ROOT / "config" / "preferences.yaml").read_text())
    enabled = (prefs.get("sources") or {}).get("enabled") or {}
    print("Collectors enabled in preferences.yaml")
    for k in sorted(enabled.keys()):
        print(f"  [{'✓' if enabled[k] else '✗'}] {k}")
    print()

    # 4. Quick connectivity probe
    print("Connectivity")
    import httpx
    for url in [
        "https://boards-api.greenhouse.io/v1/boards/airbnb/jobs",
        "https://api.lever.co/v0/postings/netflix?mode=json",
        "https://api.ashbyhq.com/posting-api/job-board/openai?includeCompensation=true",
        "https://api.smartrecruiters.com/v1/companies/Bosch/postings?limit=1",
        "https://remoteok.com/api",
    ]:
        try:
            r = httpx.get(url, timeout=5, follow_redirects=True)
            print(f"  [{r.status_code}] {url}")
        except Exception as e:
            print(f"  [ERR] {url}  ({e})")

    print()
    print("doctor complete.")
    return 0


def cmd_run(args) -> int:
    _apply_flags(args)
    _load_dotenv()
    from .pipeline import run
    import asyncio
    rc = asyncio.run(run())
    if args.open:
        cmd_open(args)
    return rc


def cmd_quick(args) -> int:
    _apply_flags(args)
    _load_dotenv()
    from .pipeline import run_ats_only
    import asyncio
    return asyncio.run(run_ats_only())


def cmd_google(args) -> int:
    _apply_flags(args)
    _load_dotenv()
    from .pipeline import run_google_window
    import asyncio
    return asyncio.run(run_google_window())


def cmd_open(args) -> int:
    exports = sorted((ROOT / "data" / "exports").glob("jobs_*.xlsx"))
    if not exports:
        print("no xlsx exports found. run `python3 -m jobs run` first.")
        return 1
    latest = exports[-1]
    print(f"opening {latest}")
    subprocess.run(["open", str(latest)], check=False)
    return 0


def cmd_install(args) -> int:
    script = ROOT / "scheduler" / "install.sh"
    if not script.exists():
        print("scheduler/install.sh missing.")
        return 1
    return subprocess.call(["/bin/zsh", str(script)])


def cmd_uninstall(args) -> int:
    script = ROOT / "scheduler" / "uninstall.sh"
    if not script.exists():
        return 1
    return subprocess.call(["/bin/zsh", str(script)])


def _apply_flags(args) -> None:
    if getattr(args, "top", None) is not None:
        os.environ["SCORE_TOP_N"] = str(args.top)
    if getattr(args, "scorer", None):
        os.environ["JOB_SCORER"] = args.scorer
    if getattr(args, "no_ai", False):
        os.environ["JOB_SCORER"] = "none"
    if getattr(args, "rescore", False):
        os.environ["RESCORE_AFTER_DAYS"] = "0"
    if getattr(args, "log_level", None):
        os.environ["LOG_LEVEL"] = args.log_level


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="jobs", description="Internship hunt pipeline")
    sub = p.add_subparsers(dest="cmd", required=True)

    sp = sub.add_parser("setup", help="First-time setup")
    sp.add_argument("--install-deps", action="store_true")
    sp.set_defaults(func=cmd_setup)

    sp = sub.add_parser("doctor", help="Print env / config diagnostics")
    sp.set_defaults(func=cmd_doctor)

    for cmd_name in ("run", "quick", "google"):
        sp = sub.add_parser(cmd_name)
        sp.add_argument("--top", type=int)
        sp.add_argument("--scorer", choices=["auto", "claude_api", "openai_api", "gemini_api", "github_models", "bedrock", "none"])
        sp.add_argument("--no-ai", action="store_true")
        sp.add_argument("--rescore", action="store_true")
        sp.add_argument("--log-level")
        sp.add_argument("--open", action="store_true")
        sp.set_defaults(func={"run": cmd_run, "quick": cmd_quick, "google": cmd_google}[cmd_name])

    sp = sub.add_parser("open", help="Open latest xlsx export")
    sp.set_defaults(func=cmd_open)

    sp = sub.add_parser("install", help="Install launchd schedulers")
    sp.set_defaults(func=cmd_install)

    sp = sub.add_parser("uninstall", help="Remove launchd schedulers")
    sp.set_defaults(func=cmd_uninstall)

    args = p.parse_args(argv)
    return args.func(args) or 0


if __name__ == "__main__":
    sys.exit(main())
