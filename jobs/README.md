# Internship Hunt 2027 — single-command USA SWE intern pipeline

Read-only, hands-off-LinkedIn aggregator + AI scorer + spreadsheet exporter
that becomes your **single source of truth for every tech intern role in the USA**.

Built for: MCS @ UIUC, Aug 2026 start, needs H-1B sponsorship, targeting Summer 2027.

---

## Quick start — three commands

```bash
cd /Users/nandish.chokshi/Downloads/portfolio/jobs

./jobs.sh setup --install-deps    # creates .env + data dirs, installs python deps
# now open .env and paste ONE api key (Claude, OpenAI or Gemini — any one works)
./jobs.sh doctor                  # verifies env, deps, connectivity
./jobs.sh run --open              # full pipeline + opens the result
```

That's it.

---

## What `./jobs.sh` can do

```
./jobs.sh setup --install-deps        # one-time bootstrap
./jobs.sh doctor                      # which provider auto-picked? what keys missing?
./jobs.sh run                         # full: collect + dedupe + filter + AI score + xlsx + sheets
./jobs.sh run --open                  # full + open xlsx in Excel/Numbers
./jobs.sh run --no-ai                 # skip AI scoring (free, fast)
./jobs.sh run --top 100               # only AI-score top 100 candidates
./jobs.sh run --scorer claude_api     # force a specific provider
./jobs.sh run --rescore               # ignore the 14-day re-score cache
./jobs.sh quick                       # ATS-only collect (no AI, no export) — for hourly cron
./jobs.sh google                      # Google-only poll (used in Oct/Nov window)
./jobs.sh open                        # open the latest xlsx
./jobs.sh install                     # install hourly + daily launchd schedulers
./jobs.sh uninstall                   # remove them
```

---

## Bring-your-own AI key — any of these works

Drop ONE of these into `.env`. `JOB_SCORER=auto` (the default) picks the best
available in this order:

| Priority | Provider           | Env var              | Get a key                                          | ~Cost / 100 jobs |
| -------- | ------------------ | -------------------- | -------------------------------------------------- | ---------------- |
| 1        | Claude (Anthropic) | `ANTHROPIC_API_KEY`  | https://console.anthropic.com/settings/keys        | $0.30 (Sonnet)   |
| 2        | ChatGPT (OpenAI)   | `OPENAI_API_KEY`     | https://platform.openai.com/api-keys               | $0.20 (4o-mini)  |
| 3        | Gemini (Google)    | `GEMINI_API_KEY`     | https://aistudio.google.com/apikey                 | $0.04 (Flash) — biggest free tier |
| 4        | AWS Bedrock        | `AWS_ACCESS_KEY_ID`  | new AWS account → $200 promo credit covers months  | "free"           |
| 5        | GitHub Models      | `GITHUB_TOKEN` / `gh auth login` | https://github.com/settings/tokens   | free (rate-limited) |
| —        | (none)             | —                    | —                                                  | $0               |

Pick by environment variable, or force one:

```bash
./jobs.sh run --scorer gemini_api          # use Gemini
./jobs.sh run --scorer claude_api          # use Claude
JOB_SCORER=openai_api ./jobs.sh run        # via env
```

---

## Sources (collectors)

| Source                         | Volume       | Status | Notes                              |
| ------------------------------ | ------------ | ------ | ---------------------------------- |
| Simplify + Vansh GitHub repos  | ~500 intern  | on     | community-maintained               |
| Greenhouse public ATS (~330)   | ~5,000+      | on     | airbnb, stripe, datadog, ...       |
| Lever public ATS (~150)        | ~1,500       | on     | netflix, postman, ramp, ...        |
| Ashby public ATS (~190)        | ~2,200       | on     | linear, vercel, ramp, ...          |
| **Workday public CXS (~93)**   | **~1,700**   | on     | microsoft, apple, oracle, salesforce, citi, jpmc, ... |
| SmartRecruiters API (~50)      | ~30          | on     | cisco, slack, bosch, ...           |
| Google careers direct          | ~10          | on     | HTML scrape                        |
| HN "Who is Hiring" Algolia     | varies       | on     | monthly thread                     |
| **RemoteOK JSON API**          | small        | on     | remote-friendly                    |
| **Remotive JSON API**          | small        | on     | remote-friendly                    |
| **WeWorkRemotely RSS** (4 feeds)| small       | on     | remote-friendly                    |
| YC Work at a Startup           | —            | off    | now login-gated                    |
| LinkedIn guest API             | ~25/page     | off    | rate-sensitive; flip in prefs.yaml |

Today's snapshot: **19,000 raw → ~200 USA SWE intern candidates after filter + tech-relevance + Summer 2027 season check**.

---

## Pipeline stages

```
collect ─▶ normalize ─▶ dedupe ─▶ filter ─▶ pre-rank ─▶ AI-score ─▶ sqlite ─▶ xlsx + sheets
   (a)        (b)         (c)       (d)       (e)        (f)         (g)        (h)
```

- (c) SHA-256 canonical key, merges duplicates across sources
- (d) **5 filters**: title (intern), tech-relevance (SWE/data/ML), USA-only,
  freshness (21d), Summer-2027 season, H-1B sponsor heuristic
- (e) ranks SWE-titled + Summer-2027-explicit roles to the top of the AI queue
- (f) AI-scores top-N (default 300) via auto-selected provider; **incrementally
  skips jobs scored in the last 14 days**
- (h) writes locked 29-column schema with conditional formatting

---

## launchd schedulers (`./jobs.sh install`)

| Label                              | Cadence                  | Mode    | Purpose                  |
| ---------------------------------- | ------------------------ | ------- | ------------------------ |
| com.nandish.jobs.ats               | every hour               | `quick` | cheap ATS-only refresh   |
| com.nandish.jobs.daily             | 6:00 AM daily            | `run`   | full collect + AI + export |
| com.nandish.jobs.google-window     | every 15-30m, 7-23h      | `google`| Oct 15 – Nov 15 only; Discord pings on new Google posts |

Logs land in `data/logs/`.

---

## Cost optimizations baked in

1. **Auto-detect provider** — picks Gemini Flash if you have a Gemini key (cheapest), else GPT-4o-mini, else Claude.
2. **Tech-relevance pre-filter** — drops non-CS intern roles (HR, sales, law, finance ops) *before* AI scoring. Saved 627 calls in today's run.
3. **Incremental scoring** — `RESCORE_AFTER_DAYS=14` (env). Same job posted on 4 boards = scored once.
4. **Season filter** — drops explicit Summer 2024/25/26 roles before AI.
5. **`SCORE_TOP_N`** — default 300; lower it once you have a stable pipeline.
6. **Two-tier scheduling** — hourly run uses no AI; only the daily run pays the API.

Result: scoring ~50 net-new jobs/day via Gemini Flash costs **~$0.02/day → ~$0.60/month**. Via Claude Sonnet 4.5, ~$0.15/day → $4.50/month.

---

## H-1B sponsorship handling

`config/preferences.yaml > sponsorship.known_sponsors / known_blockers` is
injected into the AI prompt so the model gets a strong prior on companies that
historically sponsor (Google, Meta, Stripe, ...) vs companies that almost never
sponsor (clearance contractors, regional gov). The AI returns a Sponsorship
column with values: `Yes / Likely Yes / Likely No / No / Unknown`. The xlsx
applies conditional formatting (green/red) on that column.

---

## What you still need to provide (optional)

| Item                       | Required? | Why                                  |
| -------------------------- | --------- | ------------------------------------ |
| ONE AI key in `.env`       | **yes** for AI scoring | Claude, OpenAI, or Gemini — any one |
| `GOOGLE_SHEETS_SA_JSON`    | optional  | live Sheet dashboard (see `.env.example`) |
| `DISCORD_WEBHOOK_URL`      | optional  | new-Google-job pings during Oct/Nov  |
| Additional Workday tenants | optional  | tell me, I'll add tenant IDs         |

---

## File layout

```
portfolio/jobs/
├── jobs.sh                              ← one-command entry
├── .env / .env.example                  ← your secrets
├── requirements.txt
├── config/
│   ├── preferences.yaml                 ← your knobs
│   ├── resume.md                        ← injected into AI prompt
│   ├── prompts/score_prompt.md
│   └── companies/{greenhouse,lever,ashby,smartrecruiters}.txt
│                  workday.json
├── jobs/
│   ├── cli.py / __main__.py             ← the CLI
│   ├── pipeline.py
│   ├── filter.py                        ← USA + season + tech-relevance + sponsorship
│   ├── dedupe.py
│   ├── models.py
│   ├── collectors/
│   │   ├── ashby.py
│   │   ├── github_repos.py
│   │   ├── google_careers.py
│   │   ├── greenhouse.py
│   │   ├── hn_hiring.py
│   │   ├── lever.py
│   │   ├── linkedin_guest.py
│   │   ├── rss_feeds.py                 ← RemoteOK / Remotive / WeWorkRemotely
│   │   ├── smartrecruiters.py
│   │   ├── workatastartup.py
│   │   └── workday.py
│   ├── scorers/
│   │   ├── base.py
│   │   ├── claude_api.py                ← Anthropic
│   │   ├── openai_api.py                ← ChatGPT
│   │   ├── gemini_api.py                ← Google Gemini
│   │   ├── github_models.py             ← free fallback
│   │   └── __init__.py                  ← auto-picks based on env
│   └── output/{excel,sheets,sqlite}.py
├── scheduler/
│   ├── install.sh / uninstall.sh
│   ├── run_ats.sh / run_full.sh / run_google_window.sh
│   └── launchd/com.nandish.jobs.{ats,daily,google-window}.plist
└── data/
    ├── exports/jobs_<timestamp>.xlsx
    ├── snapshots/<date>/<source>/
    ├── logs/
    └── jobs.db                          ← SQLite source of truth
```
