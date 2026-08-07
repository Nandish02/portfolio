import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FaEye,
  FaUsers,
  FaLayerGroup,
  FaBolt,
  FaSyncAlt,
  FaSignOutAlt,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const ENDPOINT = (process.env.REACT_APP_TELEMETRY_ENDPOINT || '').replace(/\/$/, '');
const TOKEN_KEY = 'nc_admin_token';
const REFRESH_MS = 15000;

/* ------------------------------- helpers ------------------------------- */

const relTime = (ts) => {
  const s = Math.floor((Date.now() - Number(ts)) / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const fmtTime = (ts) =>
  new Date(Number(ts)).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const EVENT_META = {
  pageview: { emoji: '\u{1F441}', label: 'Pageview', color: '#0355B0' },
  section_view: { emoji: '\u{1F4C4}', label: 'Section', color: '#7c3aed' },
  click: { emoji: '\u{1F5B1}', label: 'Click', color: '#0891b2' },
  form_submit: { emoji: '\u2709', label: 'Message', color: '#059669' },
};

const useCountUp = (target, duration = 900) => {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const end = Number(target) || 0;
    if (start === end) {
      setVal(end);
      return undefined;
    }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = end;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
};

/* ------------------------------- widgets ------------------------------- */

const StatCard = ({ icon: Icon, label, value, color }) => {
  const animated = useCountUp(value);
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon size={16} />
      </div>
      <p className="text-3xl font-bold tabular-nums text-slate-900">{animated.toLocaleString()}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
};

const PALETTE = ['#0355B0', '#7c3aed', '#0891b2', '#059669', '#d97706', '#e11d48'];

const Donut = ({ title, rows }) => {
  const total = rows.reduce((a, r) => a + (Number(r.c) || 0), 0);
  const R = 42;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      {total === 0 ? (
        <p className="text-xs text-slate-400">No data yet.</p>
      ) : (
        <div className="flex items-center gap-5">
          <svg viewBox="0 0 110 110" className="h-24 w-24 -rotate-90">
            <circle cx="55" cy="55" r={R} fill="none" stroke="#e2e8f0" strokeWidth="12" />
            {rows.map((r, i) => {
              const frac = (Number(r.c) || 0) / total;
              const dash = frac * C;
              const seg = (
                <circle
                  key={r.k || i}
                  cx="55"
                  cy="55"
                  r={R}
                  fill="none"
                  stroke={PALETTE[i % PALETTE.length]}
                  strokeWidth="12"
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={-offset}
                  style={{ transition: 'stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease' }}
                />
              );
              offset += dash;
              return seg;
            })}
          </svg>
          <ul className="flex-1 space-y-1.5">
            {rows.map((r, i) => (
              <li key={r.k || i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                  />
                  {r.k || 'Unknown'}
                </span>
                <span className="font-semibold text-slate-400">
                  {Math.round(((Number(r.c) || 0) / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const BarList = ({ title, rows, sub, accent = '#0355B0', empty }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
  const max = Math.max(1, ...rows.map((r) => Number(r.c) || 0));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-400">{empty || 'No data yet.'}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.slice(0, 12).map((r, i) => {
            const val = Number(r.c) || 0;
            const label = r.k == null || r.k === '' ? 'Unknown' : r.k;
            return (
              <li key={`${label}-${i}`} className="group">
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-slate-600" title={String(label)}>
                    {label}
                    {sub && r[sub] ? <span className="text-slate-400"> · {r[sub]}</span> : null}
                  </span>
                  <span className="shrink-0 font-semibold text-slate-500 tabular-nums">{val}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: mounted ? `${(val / max) * 100}%` : '0%',
                      backgroundColor: accent,
                      transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const Timeline = ({ rows }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
  const max = Math.max(1, ...rows.map((r) => Number(r.c) || 0));
  const fmt = (day) =>
    new Date(Number(day) * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">Activity (events / day)</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-400">No data yet.</p>
      ) : (
        <div className="flex h-40 items-end gap-1.5 overflow-x-auto pb-1">
          {rows.map((r, i) => (
            <div key={i} className="group flex min-w-[26px] flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="relative w-full rounded-t-md bg-gradient-to-t from-[#0355B0] to-[#3b82f6] transition-all duration-700 hover:from-[#024390] hover:to-[#60a5fa]"
                  style={{ height: mounted ? `${(Number(r.c) / max) * 100}%` : '0%' }}
                >
                  <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {r.c} events · {r.v} visitors
                  </span>
                </div>
              </div>
              <span className="whitespace-nowrap text-[9px] text-slate-400">{fmt(r.day)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LiveFeed = ({ rows, tick }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Live activity
    </h3>
    {rows.length === 0 ? (
      <p className="text-xs text-slate-400">Waiting for visitors…</p>
    ) : (
      <ul className="max-h-[560px] space-y-2 overflow-y-auto pr-1" data-tick={tick}>
        {rows.slice(0, 30).map((r, i) => {
          const meta = EVENT_META[r.type] || { emoji: '\u2022', label: r.type, color: '#64748b' };
          const place = [r.city, r.country].filter(Boolean).join(', ') || 'Unknown';
          return (
            <li
              key={`${r.ts}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                style={{ backgroundColor: `${meta.color}18` }}
              >
                {meta.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-slate-700">
                  <span style={{ color: meta.color }} className="font-semibold">
                    {meta.label}
                  </span>
                  {r.section ? <span className="text-slate-500"> · {r.section}</span> : null}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {place} · {r.browser || '?'} / {r.os || '?'}
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-slate-400">{relTime(r.ts)}</span>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);

const RecentTable = ({ rows, tick }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <h3 className="text-sm font-semibold text-slate-700">Recent events (detailed)</h3>
      <span className="text-[11px] text-slate-400">{rows.length} shown</span>
    </div>
    {rows.length === 0 ? (
      <p className="px-5 py-4 text-xs text-slate-400">No events yet.</p>
    ) : (
      <div className="max-h-[560px] overflow-auto" data-tick={tick}>
        <table className="w-full min-w-[820px] border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Time</th>
              <th className="px-4 py-2.5 font-semibold">Event</th>
              <th className="px-4 py-2.5 font-semibold">Where</th>
              <th className="px-4 py-2.5 font-semibold">Location</th>
              <th className="px-4 py-2.5 font-semibold">Device</th>
              <th className="px-4 py-2.5 font-semibold">Referrer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => {
              const meta = EVENT_META[r.type] || { emoji: '\u2022', label: r.type, color: '#64748b' };
              const location =
                [r.city, r.region, r.country].filter(Boolean).join(', ') || 'Unknown';
              let ref = 'Direct';
              if (r.ref) {
                try {
                  ref = new URL(r.ref).hostname.replace(/^www\./, '');
                } catch (_) {
                  ref = r.ref;
                }
              }
              return (
                <tr key={`${r.ts}-${i}`} className="transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-2.5 align-top text-slate-600">
                    <div>{fmtTime(r.ts)}</div>
                    <div className="text-[10px] text-slate-400">{relTime(r.ts)}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 align-top">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                    >
                      {meta.emoji} {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 align-top text-slate-600">
                    <div className="max-w-[180px] truncate" title={r.section || r.path || ''}>
                      {r.section || '\u2014'}
                    </div>
                    {r.path ? <div className="text-[10px] text-slate-400">{r.path}</div> : null}
                  </td>
                  <td className="px-4 py-2.5 align-top text-slate-600">
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt size={9} className="shrink-0 text-slate-400" />
                      <span className="max-w-[180px] truncate" title={location}>
                        {location}
                      </span>
                    </span>
                    {r.tz ? <div className="text-[10px] text-slate-400">{r.tz}</div> : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 align-top text-slate-600">
                    {r.device || '?'}
                    <div className="text-[10px] text-slate-400">
                      {r.browser || '?'} / {r.os || '?'}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 align-top text-slate-600">
                    <span className="max-w-[140px] truncate" title={r.ref || 'Direct'}>
                      {ref}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

/* ------------------------------ main view ------------------------------ */

function AdminDashboard() {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || '';
    } catch (_) {
      return '';
    }
  });
  const [input, setInput] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [live, setLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async (tok, opts = {}) => {
    if (!ENDPOINT) {
      setError('REACT_APP_TELEMETRY_ENDPOINT is not configured in this build.');
      return;
    }
    if (!opts.silent) setLoading(true);
    try {
      const res = await fetch(`${ENDPOINT}/api/stats`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (res.status === 401) {
        setError('Invalid token.');
        setData(null);
        try {
          sessionStorage.removeItem(TOKEN_KEY);
        } catch (_) {
          /* ignore */
        }
        setToken('');
        return;
      }
      if (!res.ok) {
        setError(`Server error (${res.status}).`);
        return;
      }
      setData(await res.json());
      setError('');
      setLastUpdated(Date.now());
    } catch (_) {
      setError('Could not reach the telemetry server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  useEffect(() => {
    if (!token || !live) return undefined;
    const id = setInterval(() => load(token, { silent: true }), REFRESH_MS);
    return () => clearInterval(id);
  }, [token, live, load]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    try {
      sessionStorage.setItem(TOKEN_KEY, t);
    } catch (_) {
      /* ignore */
    }
    setToken(t);
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (_) {
      /* ignore */
    }
    setToken('');
    setData(null);
    setInput('');
  };

  /* ------------------------------ login ------------------------------ */
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#0355B0]">
            <FaBolt className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Telemetry Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your admin token to continue.</p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Admin token"
            autoFocus
            className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0355B0] focus:ring-2 focus:ring-[#0355B0]/20"
          />
          {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-[#0355B0] py-2.5 text-sm font-semibold text-white transition hover:bg-[#024390]"
          >
            Unlock
          </button>
          {!ENDPOINT ? (
            <p className="mt-4 text-[11px] text-amber-600">
              Note: no telemetry endpoint is configured in this build yet.
            </p>
          ) : null}
        </form>
      </div>
    );
  }

  /* ---------------------------- dashboard ---------------------------- */
  const t = data?.totals || {};

  return (
    <div className="min-h-screen bg-[#FAFAFA] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Visitor Telemetry</h1>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500" data-tick={tick}>
              {live && (
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  LIVE
                </span>
              )}
              {lastUpdated ? `· updated ${relTime(lastUpdated)}` : 'Loading…'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLive((v) => !v)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                live
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {live ? 'Auto-refresh: On' : 'Auto-refresh: Off'}
            </button>
            <button
              onClick={() => load(token)}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <FaSyncAlt size={11} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <FaSignOutAlt size={11} /> Log out
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {data ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard icon={FaEye} label="Pageviews" value={t.pageviews} color="#0355B0" />
              <StatCard icon={FaUsers} label="Unique visitors" value={t.visitors} color="#7c3aed" />
              <StatCard icon={FaLayerGroup} label="Sessions" value={t.sessions} color="#0891b2" />
              <StatCard icon={FaBolt} label="Total events" value={t.events} color="#d97706" />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-2">
                <Timeline rows={data.timeline || []} />
                <div className="grid gap-5 sm:grid-cols-3">
                  <Donut title="Devices" rows={data.byDevice || []} />
                  <BarList title="Browsers" rows={data.byBrowser || []} accent="#059669" />
                  <BarList title="Operating systems" rows={data.byOs || []} accent="#d97706" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <BarList title="Top countries" rows={data.byCountry || []} sub="v" accent="#0355B0" />
                  <BarList title="Top cities" rows={data.byCity || []} sub="country" accent="#7c3aed" />
                </div>
              </div>
              <LiveFeed rows={data.recent || []} tick={tick} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <BarList
                title="Referrers"
                rows={data.byReferrer || []}
                accent="#e11d48"
                empty="Only direct visits so far."
              />
              <BarList title="Sections viewed" rows={data.bySection || []} accent="#7c3aed" />
            </div>

            <BarList
              title="Clicks / interactions"
              rows={data.byLink || []}
              accent="#0891b2"
              empty="No tracked clicks yet."
            />

            <RecentTable rows={data.recent || []} tick={tick} />

            <div className="flex items-center gap-1.5 pb-4 text-[11px] text-slate-400">
              <FaMapMarkerAlt size={10} /> Locations are approximate (IP-based).
            </div>
          </div>
        ) : (
          !error && <p className="text-sm text-slate-500">Loading dashboard…</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
