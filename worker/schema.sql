-- Cloudflare D1 schema for nc-telemetry (recovered 2026-08-07 from live deployment)
CREATE TABLE IF NOT EXISTS events (
  id           TEXT PRIMARY KEY,
  ts           INTEGER NOT NULL,      -- event time (ms since epoch)
  visitor_id   TEXT,                  -- anonymous, persistent per browser
  session_id   TEXT,                  -- anonymous, per tab session
  type         TEXT,                  -- pageview | section_view | click | form_submit
  path         TEXT,                  -- hash route, e.g. #/ or #/lab
  section      TEXT,                  -- section name (section_view) or label (click)
  ref          TEXT,                  -- document.referrer
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  ip_hash      TEXT,                  -- salted SHA-256 of IP, never raw
  country      TEXT,
  region       TEXT,
  city         TEXT,
  lat          REAL,
  lng          REAL,
  tz           TEXT,
  isp          TEXT,                  -- Cloudflare asOrganization
  ua           TEXT,
  browser      TEXT,
  os           TEXT,
  device       TEXT,                  -- Desktop | Mobile | Tablet
  screen       TEXT,                  -- e.g. 1920x1080
  lang         TEXT
);
CREATE INDEX IF NOT EXISTS idx_events_ts      ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_type    ON events(type);

CREATE TABLE IF NOT EXISTS geo_cache (
  ip_hash TEXT PRIMARY KEY,
  city TEXT, region TEXT, country TEXT,
  lat REAL, lng REAL, isp TEXT, ts INTEGER
);
