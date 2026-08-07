var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var src_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") {
      return cors(env, new Response(null, { status: 204 }));
    }
    if (url.pathname === "/collect" && req.method === "POST") {
      return collect(req, env);
    }
    if (url.pathname === "/api/stats" && req.method === "GET") {
      return stats(req, env);
    }
    return cors(env, json({ error: "not_found" }, 404));
  }
};
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json, "json");
function cors(env, res) {
  const origin = env && env.ALLOWED_ORIGIN || "*";
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Max-Age", "86400");
  res.headers.set("Vary", "Origin");
  return res;
}
__name(cors, "cors");
async function sha256Hex(str) {
  const data = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
__name(sha256Hex, "sha256Hex");
function parseUA(ua = "") {
  const s = ua.toLowerCase();
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";
  if (/windows nt/.test(s))
    os = "Windows";
  else if (/mac os x|macintosh/.test(s))
    os = "macOS";
  else if (/android/.test(s))
    os = "Android";
  else if (/iphone|ipad|ipod/.test(s))
    os = "iOS";
  else if (/cros/.test(s))
    os = "ChromeOS";
  else if (/linux/.test(s))
    os = "Linux";
  if (/edg\//.test(s))
    browser = "Edge";
  else if (/opr\/|opera/.test(s))
    browser = "Opera";
  else if (/samsungbrowser/.test(s))
    browser = "Samsung Internet";
  else if (/firefox|fxios/.test(s))
    browser = "Firefox";
  else if (/chrome|crios/.test(s))
    browser = "Chrome";
  else if (/safari/.test(s))
    browser = "Safari";
  if (/ipad|tablet|(android(?!.*mobile))/.test(s))
    device = "Tablet";
  else if (/mobile|iphone|ipod|android/.test(s))
    device = "Mobile";
  return { browser, os, device };
}
__name(parseUA, "parseUA");
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
__name(num, "num");
async function resolveGeo(ip, env) {
  if (!ip)
    return null;
  try {
    if (env.IPINFO_TOKEN) {
      const r2 = await fetch(`https://ipinfo.io/${ip}/json?token=${env.IPINFO_TOKEN}`, {
        headers: { Accept: "application/json" }
      });
      if (r2.ok) {
        const d = await r2.json();
        const [lat, lng] = String(d.loc || ",").split(",");
        return {
          city: d.city || null,
          region: d.region || null,
          country: d.country || null,
          lat: num(lat),
          lng: num(lng),
          isp: d.org || null
        };
      }
    }
    const r = await fetch(`https://ipwho.is/${ip}`, { headers: { Accept: "application/json" } });
    if (r.ok) {
      const d = await r.json();
      if (d && d.success !== false) {
        return {
          city: d.city || null,
          region: d.region || null,
          country: d.country_code || null,
          lat: num(d.latitude),
          lng: num(d.longitude),
          isp: d.connection && d.connection.isp || d.isp || null
        };
      }
    }
  } catch (_) {
  }
  return null;
}
__name(resolveGeo, "resolveGeo");
var GEO_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1e3;
async function readGeoCache(ipHash, env) {
  try {
    const row = await env.DB.prepare(
      `SELECT city, region, country, lat, lng, isp, ts FROM geo_cache WHERE ip_hash = ?`
    ).bind(ipHash).first();
    if (row && Date.now() - Number(row.ts) < GEO_CACHE_TTL_MS)
      return row;
  } catch (_) {
  }
  return null;
}
__name(readGeoCache, "readGeoCache");
async function writeGeoCache(ipHash, g, env) {
  try {
    await env.DB.prepare(
      `INSERT OR REPLACE INTO geo_cache (ip_hash, city, region, country, lat, lng, isp, ts)
       VALUES (?,?,?,?,?,?,?,?)`
    ).bind(ipHash, g.city, g.region, g.country, g.lat, g.lng, g.isp, Date.now()).run();
  } catch (_) {
  }
}
__name(writeGeoCache, "writeGeoCache");
async function collect(req, env) {
  let body;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return cors(env, json({ error: "bad_json" }, 400));
  }
  const events = Array.isArray(body.events) ? body.events : [];
  if (events.length === 0) {
    return cors(env, json({ ok: true, inserted: 0 }));
  }
  const capped = events.slice(0, 50);
  const cf = req.cf || {};
  const ip = req.headers.get("CF-Connecting-IP") || "";
  const ipHash = await sha256Hex((env.IP_HASH_SALT || "nc-salt") + ip);
  const meta = body.meta || {};
  const utm = meta.utm || {};
  const { browser, os, device } = parseUA(meta.ua || req.headers.get("User-Agent") || "");
  const geo = {
    country: cf.country || null,
    region: cf.region || null,
    city: cf.city || null,
    lat: num(cf.latitude),
    lng: num(cf.longitude),
    tz: cf.timezone || meta.tz || null,
    isp: cf.asOrganization || null
  };
  let resolved = await readGeoCache(ipHash, env);
  if (!resolved) {
    resolved = await resolveGeo(ip, env);
    if (resolved)
      await writeGeoCache(ipHash, resolved, env);
  }
  if (resolved) {
    if (resolved.city)
      geo.city = resolved.city;
    if (resolved.region)
      geo.region = resolved.region;
    if (resolved.country)
      geo.country = resolved.country;
    if (resolved.lat != null)
      geo.lat = resolved.lat;
    if (resolved.lng != null)
      geo.lng = resolved.lng;
    if (resolved.isp)
      geo.isp = resolved.isp;
  }
  const sql = `INSERT OR IGNORE INTO events
    (id, ts, visitor_id, session_id, type, path, section, ref,
     utm_source, utm_medium, utm_campaign, ip_hash,
     country, region, city, lat, lng, tz, isp,
     ua, browser, os, device, screen, lang)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const stmt = env.DB.prepare(sql);
  const batch = capped.map(
    (e) => stmt.bind(
      crypto.randomUUID(),
      num(e.ts) || Date.now(),
      body.vid || null,
      body.sid || null,
      (e.type || "event").slice(0, 40),
      e.path ? String(e.path).slice(0, 200) : null,
      e.section ? String(e.section).slice(0, 120) : null,
      meta.ref ? String(meta.ref).slice(0, 300) : null,
      utm.source || null,
      utm.medium || null,
      utm.campaign || null,
      ipHash,
      geo.country,
      geo.region,
      geo.city,
      geo.lat,
      geo.lng,
      geo.tz,
      geo.isp,
      meta.ua ? String(meta.ua).slice(0, 400) : null,
      browser,
      os,
      device,
      meta.screen || null,
      meta.lang || null
    )
  );
  try {
    await env.DB.batch(batch);
  } catch (err) {
    return cors(env, json({ error: "db_error", detail: String(err) }, 500));
  }
  return cors(env, json({ ok: true, inserted: batch.length }));
}
__name(collect, "collect");
async function stats(req, env) {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
    return cors(env, json({ error: "unauthorized" }, 401));
  }
  const DB = env.DB;
  const q = /* @__PURE__ */ __name((sql) => DB.prepare(sql).all(), "q");
  try {
    const [
      totals,
      recent,
      byCountry,
      byCity,
      byReferrer,
      byDevice,
      byBrowser,
      byOs,
      bySection,
      byLink,
      timeline,
      points
    ] = await Promise.all([
      DB.prepare(
        `SELECT COUNT(*) AS events,
                COUNT(DISTINCT visitor_id) AS visitors,
                COUNT(DISTINCT session_id) AS sessions,
                SUM(CASE WHEN type='pageview' THEN 1 ELSE 0 END) AS pageviews
         FROM events`
      ).first(),
      q(
        `SELECT ts, visitor_id, session_id, type, path, section,
                city, region, country, lat, lng, device, browser, os, ref, lang, tz, isp
         FROM events ORDER BY ts DESC LIMIT 100`
      ),
      q(
        `SELECT COALESCE(country,'Unknown') AS k, COUNT(*) AS c,
                COUNT(DISTINCT visitor_id) AS v
         FROM events GROUP BY country ORDER BY c DESC LIMIT 25`
      ),
      q(
        `SELECT COALESCE(city,'Unknown') AS k, COALESCE(country,'') AS country,
                COUNT(*) AS c, COUNT(DISTINCT visitor_id) AS v
         FROM events GROUP BY city, country ORDER BY c DESC LIMIT 25`
      ),
      q(
        `SELECT COALESCE(NULLIF(ref,''),'Direct / None') AS k, COUNT(*) AS c
         FROM events WHERE type='pageview'
         GROUP BY k ORDER BY c DESC LIMIT 15`
      ),
      q(
        `SELECT COALESCE(device,'Unknown') AS k, COUNT(DISTINCT visitor_id) AS c
         FROM events GROUP BY device ORDER BY c DESC`
      ),
      q(
        `SELECT COALESCE(browser,'Unknown') AS k, COUNT(DISTINCT visitor_id) AS c
         FROM events GROUP BY browser ORDER BY c DESC`
      ),
      q(
        `SELECT COALESCE(os,'Unknown') AS k, COUNT(DISTINCT visitor_id) AS c
         FROM events GROUP BY os ORDER BY c DESC`
      ),
      q(
        `SELECT section AS k, COUNT(*) AS c
         FROM events WHERE type='section_view' AND section IS NOT NULL
         GROUP BY section ORDER BY c DESC`
      ),
      q(
        `SELECT section AS k, COUNT(*) AS c
         FROM events WHERE type='click' AND section IS NOT NULL
         GROUP BY section ORDER BY c DESC LIMIT 25`
      ),
      q(
        `SELECT CAST(ts/86400000 AS INTEGER) AS day,
                COUNT(*) AS c, COUNT(DISTINCT visitor_id) AS v
         FROM events GROUP BY day ORDER BY day DESC LIMIT 30`
      ),
      q(
        `SELECT city, region, country,
                ROUND(lat,1) AS lat, ROUND(lng,1) AS lng,
                COUNT(*) AS c, COUNT(DISTINCT visitor_id) AS v
         FROM events
         WHERE lat IS NOT NULL AND lng IS NOT NULL
         GROUP BY ROUND(lat,1), ROUND(lng,1)
         ORDER BY c DESC LIMIT 200`
      )
    ]);
    return cors(
      env,
      json({
        totals: totals || { events: 0, visitors: 0, sessions: 0, pageviews: 0 },
        recent: recent.results || [],
        byCountry: byCountry.results || [],
        byCity: byCity.results || [],
        byReferrer: byReferrer.results || [],
        byDevice: byDevice.results || [],
        byBrowser: byBrowser.results || [],
        byOs: byOs.results || [],
        bySection: bySection.results || [],
        byLink: byLink.results || [],
        timeline: (timeline.results || []).reverse(),
        points: points.results || [],
        generatedAt: Date.now()
      })
    );
  } catch (err) {
    return cors(env, json({ error: "db_error", detail: String(err) }, 500));
  }
}
__name(stats, "stats");
export {
  src_default as default
};
//# sourceMappingURL=index.js.map