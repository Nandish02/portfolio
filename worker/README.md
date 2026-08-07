# nc-telemetry — Cloudflare Worker backend

Recovered 2026-08-07 from the live Cloudflare deployment (the source was never
committed before; this file is the deployed bundle pulled back via the CF API).

- **Worker:** `nc-telemetry` → `https://nc-telemetry.nandishchokshi02.workers.dev`
- **D1 database:** `nc-telemetry` (`b0daf090-a74e-47e4-8ebb-f91a8744c126`), bound as `DB`
- **Schema:** `schema.sql`

## Routes
| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/collect` | POST | none | Ingest batched events from the site |
| `/api/stats` | GET | `Authorization: Bearer <ADMIN_TOKEN>` | Aggregated stats for the admin dashboard |

## Bindings / secrets (set in the Cloudflare dashboard, not in git)
| Name | Type | Notes |
|---|---|---|
| `DB` | D1 | the `nc-telemetry` database |
| `ADMIN_TOKEN` | secret | password for `#/admin` |
| `IP_HASH_SALT` | secret | salt for the SHA-256 IP hash |
| `ALLOWED_ORIGIN` | plain text | `https://nandish02.github.io` |

## Privacy
Raw IPs are never stored — only a salted SHA-256 hash (`ip_hash`). Location is
resolved server-side from the request IP (Cloudflare `req.cf`, then ipinfo/ipwho
as fallback) and cached in `geo_cache` for 30 days. No cookies; visitor/session
ids live in web storage. The `#/admin` route is excluded from tracking.
