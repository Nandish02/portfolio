/**
 * Lightweight, privacy-aware telemetry client.
 *
 * Sends batched events to the Cloudflare Worker collector defined by
 * REACT_APP_TELEMETRY_ENDPOINT. If that env var is not set, every function
 * here silently no-ops, so the site works fine without a backend.
 *
 * No cookies are used (visitor/session ids live in web storage). Location is
 * derived server-side from the request IP; the client never asks for GPS.
 */

const ENDPOINT = (process.env.REACT_APP_TELEMETRY_ENDPOINT || "").replace(/\/$/, "");

const VID_KEY = "nc_vid";
const SID_KEY = "nc_sid";

let visitorId = null;
let sessionId = null;
let queue = [];
let flushTimer = null;
let started = false;

const uid = () => {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch (_) {
    /* ignore */
  }
  return (
    "xxxxxxxx-xxxx-4xxx".replace(/x/g, () => ((Math.random() * 16) | 0).toString(16)) +
    "-" +
    Date.now().toString(16)
  );
};

const getOrCreate = (key, storage) => {
  try {
    let v = storage.getItem(key);
    if (!v) {
      v = uid();
      storage.setItem(key, v);
    }
    return v;
  } catch (_) {
    // storage blocked (private mode / disabled) -> ephemeral id
    return uid();
  }
};

const isAdminRoute = () => {
  try {
    return (window.location.hash || "").toLowerCase().startsWith("#/admin");
  } catch (_) {
    return false;
  }
};

const parseUTM = () => {
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      source: p.get("utm_source") || "",
      medium: p.get("utm_medium") || "",
      campaign: p.get("utm_campaign") || "",
    };
  } catch (_) {
    return { source: "", medium: "", campaign: "" };
  }
};

const deviceMeta = () => {
  let tz = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch (_) {
    /* ignore */
  }
  return {
    ua: navigator.userAgent || "",
    screen: `${window.screen ? window.screen.width : 0}x${window.screen ? window.screen.height : 0}`,
    lang: navigator.language || "",
    tz,
    ref: document.referrer || "",
    utm: parseUTM(),
  };
};

const flush = () => {
  if (!ENDPOINT || queue.length === 0) return;
  const payload = JSON.stringify({
    vid: visitorId,
    sid: sessionId,
    meta: deviceMeta(),
    events: queue,
  });
  queue = [];
  const url = ENDPOINT + "/collect";
  try {
    if (navigator.sendBeacon) {
      // text/plain keeps it a CORS "simple request" (no preflight)
      const blob = new Blob([payload], { type: "text/plain;charset=UTF-8" });
      const ok = navigator.sendBeacon(url, blob);
      if (ok) return;
    }
    fetch(url, {
      method: "POST",
      body: payload,
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
    }).catch(() => {});
  } catch (_) {
    /* never let telemetry break the page */
  }
};

const scheduleFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, 2000);
};

/** Queue a single event. */
export const track = (type, data = {}) => {
  if (!ENDPOINT || !started || isAdminRoute()) return;
  queue.push({
    type,
    ts: Date.now(),
    path: window.location.hash || "/",
    ...data,
  });
  scheduleFlush();
};

/** Convenience wrapper for section-in-view events. */
export const trackSection = (section) => track("section_view", { section });

/** Initialise once, on app boot. */
export const initTelemetry = () => {
  if (started || !ENDPOINT) return;
  started = true;

  visitorId = getOrCreate(VID_KEY, window.localStorage);
  sessionId = getOrCreate(SID_KEY, window.sessionStorage);

  // Initial pageview (guarded against the admin route inside track()).
  track("pageview");

  // SPA route changes (HashRouter).
  window.addEventListener("hashchange", () => track("pageview"));

  // Delegated click tracking for any [data-track] element.
  document.addEventListener(
    "click",
    (e) => {
      const el = e.target && e.target.closest ? e.target.closest("[data-track]") : null;
      if (el) track("click", { section: el.getAttribute("data-track") });
    },
    true
  );

  // Flush on the way out.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);
  window.addEventListener("beforeunload", flush);
};

const telemetry = { initTelemetry, track, trackSection };
export default telemetry;
