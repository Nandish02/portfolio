import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FiActivity,
  FiCheckCircle,
  FiCopy,
  FiExternalLink,
  FiPower,
  FiRefreshCw,
  FiSend,
  FiSettings,
  FiSquare,
  FiTerminal,
  FiXCircle,
  FiZap,
} from 'react-icons/fi';
import ParticleCanvas from './ParticleCanvas';

const LS_KEYS = {
  proxyUrl: 'fcc.proxyUrl',
  authToken: 'fcc.authToken',
  tier: 'fcc.tier',
  history: 'fcc.chatHistory',
};

const DEFAULTS = {
  proxyUrl: 'http://localhost:8082',
  authToken: 'freecc',
  tier: 'sonnet',
};

const INSTALL_COMMANDS = {
  mac: 'curl -fsSL "https://github.com/Alishahryar1/free-claude-code/blob/main/scripts/install.sh?raw=1" | sh',
  win: 'irm "https://github.com/Alishahryar1/free-claude-code/blob/main/scripts/install.ps1?raw=1" | iex',
  start: 'fcc-server',
  claude: 'fcc-claude',
};

const TIERS = [
  {
    id: 'opus',
    label: 'Opus',
    desc: 'Highest quality',
    claudeId: 'claude-opus-4-20250514',
    backedBy: 'nemotron-super-49b (reasoning)',
    accent: 'purple',
  },
  {
    id: 'sonnet',
    label: 'Sonnet',
    desc: 'Balanced (default)',
    claudeId: 'claude-sonnet-4-20250514',
    backedBy: 'nemotron-3-super-120b',
    accent: 'blue',
  },
  {
    id: 'haiku',
    label: 'Haiku',
    desc: 'Fastest',
    claudeId: 'claude-3-5-haiku-20241022',
    backedBy: 'nemotron-mini-4b',
    accent: 'emerald',
  },
];

const TIER_BTN_STYLES = {
  purple: {
    active: 'bg-accent-purple/25 border-accent-purple/60 text-accent-purple',
    idle: 'bg-white/[0.03] border-white/10 text-white/60 hover:border-accent-purple/40 hover:text-accent-purple/90',
  },
  blue: {
    active: 'bg-accent-blue/25 border-accent-blue/60 text-accent-cyan',
    idle: 'bg-white/[0.03] border-white/10 text-white/60 hover:border-accent-blue/40 hover:text-accent-cyan/90',
  },
  emerald: {
    active: 'bg-accent-emerald/25 border-accent-emerald/60 text-accent-emerald',
    idle: 'bg-white/[0.03] border-white/10 text-white/60 hover:border-accent-emerald/40 hover:text-accent-emerald/90',
  },
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch (_) {}
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-md transition"
      title="Copy"
    >
      {copied ? <FiCheckCircle className="w-3.5 h-3.5 text-accent-emerald" /> : <FiCopy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

const MD_COMPONENTS = {
  code({ inline, className, children, ...props }) {
    const codeText = String(children).replace(/\n$/, '');
    const lang = (className || '').replace('language-', '');
    if (inline) {
      return (
        <code className="px-1.5 py-0.5 rounded bg-white/10 text-accent-cyan font-mono text-[0.85em] border border-white/10" {...props}>
          {children}
        </code>
      );
    }
    return (
      <div className="my-2 rounded-lg overflow-hidden border border-white/10 bg-black/60">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/[0.02]">
          <span className="text-[10px] uppercase tracking-wider font-mono text-white/40">{lang || 'code'}</span>
          <CopyButton text={codeText} />
        </div>
        <pre className="p-3 text-[12.5px] leading-relaxed overflow-x-auto font-mono text-accent-cyan/90">
          <code>{codeText}</code>
        </pre>
      </div>
    );
  },
  p({ children }) { return <p className="mb-2 last:mb-0">{children}</p>; },
  ul({ children }) { return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>; },
  ol({ children }) { return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>; },
  li({ children }) { return <li className="leading-snug">{children}</li>; },
  h1({ children }) { return <h1 className="text-base font-bold mt-3 mb-2">{children}</h1>; },
  h2({ children }) { return <h2 className="text-base font-bold mt-3 mb-1.5">{children}</h2>; },
  h3({ children }) { return <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>; },
  h4({ children }) { return <h4 className="text-sm font-semibold mt-2 mb-1">{children}</h4>; },
  strong({ children }) { return <strong className="font-semibold text-white">{children}</strong>; },
  em({ children }) { return <em className="italic text-white/80">{children}</em>; },
  a({ children, href }) { return <a href={href} target="_blank" rel="noreferrer" className="text-accent-cyan underline underline-offset-2 hover:text-accent-blue">{children}</a>; },
  blockquote({ children }) { return <blockquote className="border-l-2 border-accent-blue/40 pl-3 my-2 italic text-white/70">{children}</blockquote>; },
  hr() { return <hr className="my-3 border-white/10" />; },
  table({ children }) { return <div className="overflow-x-auto my-2"><table className="text-xs border-collapse">{children}</table></div>; },
  th({ children }) { return <th className="border border-white/10 px-2 py-1 bg-white/[0.04] text-left">{children}</th>; },
  td({ children }) { return <td className="border border-white/10 px-2 py-1">{children}</td>; },
};

function CommandBlock({ label, command }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.02]">
        <span className="text-[11px] uppercase tracking-wider font-mono text-white/50">{label}</span>
        <CopyButton text={command} />
      </div>
      <pre className="px-4 py-3 text-sm font-mono text-accent-cyan whitespace-pre-wrap break-all">
        {command}
      </pre>
    </div>
  );
}

function StatusPill({ state, latencyMs }) {
  const map = {
    checking: { dot: 'bg-yellow-400 animate-pulse', text: 'text-yellow-300', label: 'Checking…' },
    online: { dot: 'bg-emerald-400', text: 'text-emerald-300', label: latencyMs != null ? `Online · ${latencyMs}ms` : 'Online' },
    offline: { dot: 'bg-rose-500', text: 'text-rose-300', label: 'Offline' },
    cors: { dot: 'bg-amber-400', text: 'text-amber-300', label: 'Reachable, blocked by CORS' },
  };
  const s = map[state] || map.offline;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function Lab() {
  const [proxyUrl, setProxyUrl] = useState(() => localStorage.getItem(LS_KEYS.proxyUrl) || DEFAULTS.proxyUrl);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(LS_KEYS.authToken) || DEFAULTS.authToken);
  const [tierId, setTierId] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.tier);
    return TIERS.find((t) => t.id === saved) ? saved : DEFAULTS.tier;
  });

  const [status, setStatus] = useState('checking');
  const [latencyMs, setLatencyMs] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminEmbed, setShowAdminEmbed] = useState(false);

  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.history);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatEndRef = useRef(null);
  const abortRef = useRef(null);

  const activeTier = useMemo(
    () => TIERS.find((t) => t.id === tierId) || TIERS[1],
    [tierId]
  );

  useEffect(() => { localStorage.setItem(LS_KEYS.proxyUrl, proxyUrl); }, [proxyUrl]);
  useEffect(() => { localStorage.setItem(LS_KEYS.authToken, authToken); }, [authToken]);
  useEffect(() => { localStorage.setItem(LS_KEYS.tier, tierId); }, [tierId]);
  useEffect(() => { localStorage.setItem(LS_KEYS.history, JSON.stringify(history)); }, [history]);

  const checkStatus = useCallback(async () => {
    setStatus('checking');
    setLatencyMs(null);
    const url = `${proxyUrl.replace(/\/$/, '')}/v1/models`;
    const start = performance.now();
    try {
      await fetch(url, {
        method: 'GET',
        headers: { 'x-api-key': authToken, Authorization: `Bearer ${authToken}` },
      });
      const ms = Math.round(performance.now() - start);
      setStatus('online');
      setLatencyMs(ms);
    } catch (_) {
      try {
        await fetch(`${proxyUrl.replace(/\/$/, '')}/v1/models`, { mode: 'no-cors' });
        setStatus('cors');
      } catch {
        setStatus('offline');
      }
    }
  }, [proxyUrl, authToken]);

  useEffect(() => {
    checkStatus();
    const id = setInterval(() => {
      if (!document.hidden) checkStatus();
    }, 30000);
    return () => clearInterval(id);
  }, [checkStatus]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [history.length]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setChatError('');
    const userMsg = { role: 'user', content: text };
    const next = [...history, userMsg];
    setHistory(next);
    setInput('');
    setSending(true);

    const assistantIndex = next.length;
    setHistory((h) => [...h, { role: 'assistant', content: '', streaming: true }]);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`${proxyUrl.replace(/\/$/, '')}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': authToken,
          Authorization: `Bearer ${authToken}`,
          'anthropic-version': '2023-06-01',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          model: activeTier.claudeId,
          max_tokens: 8192,
          stream: true,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`${res.status} ${res.statusText} — ${errText.slice(0, 200)}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assembledText = '';
      let resolvedModel = '';
      const textBlockIdx = new Set();

      const applyTextDelta = (delta) => {
        assembledText += delta;
        setHistory((h) => {
          const copy = h.slice();
          if (copy[assistantIndex]) {
            copy[assistantIndex] = {
              ...copy[assistantIndex],
              content: assembledText,
              model: resolvedModel || copy[assistantIndex].model,
            };
          }
          return copy;
        });
      };

      if (!reader) throw new Error('No response body to stream.');

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sep;
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          const dataLines = rawEvent
            .split('\n')
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).trim());
          if (dataLines.length === 0) continue;
          const dataStr = dataLines.join('\n');
          if (dataStr === '[DONE]') continue;
          let payload;
          try {
            payload = JSON.parse(dataStr);
          } catch {
            continue;
          }
          const t = payload?.type;
          if (t === 'message_start') {
            resolvedModel = payload?.message?.model || resolvedModel;
          } else if (t === 'content_block_start') {
            if (payload?.content_block?.type === 'text') {
              textBlockIdx.add(payload.index);
              const seed = payload.content_block.text || '';
              if (seed) applyTextDelta(seed);
            }
          } else if (t === 'content_block_delta') {
            const d = payload?.delta || {};
            if (d.type === 'text_delta' && textBlockIdx.has(payload.index)) {
              applyTextDelta(d.text || '');
            }
          } else if (t === 'message_delta') {
            // stop_reason etc. – nothing to render
          } else if (t === 'error') {
            throw new Error(payload?.error?.message || 'Stream error');
          }
        }
      }

      setHistory((h) => {
        const copy = h.slice();
        if (copy[assistantIndex]) {
          copy[assistantIndex] = {
            ...copy[assistantIndex],
            streaming: false,
            content: assembledText || '(empty response)',
            model: resolvedModel || copy[assistantIndex].model,
          };
        }
        return copy;
      });
    } catch (e) {
      if (e.name === 'AbortError') {
        setHistory((h) => {
          const copy = h.slice();
          if (copy[assistantIndex]) {
            copy[assistantIndex] = {
              ...copy[assistantIndex],
              streaming: false,
              content: (copy[assistantIndex].content || '') + '\n\n_(stopped)_',
            };
          }
          return copy;
        });
      } else {
        setChatError(e.message || String(e));
        setHistory((h) => h.filter((_, i) => i !== assistantIndex || h[i]?.content));
      }
    } finally {
      abortRef.current = null;
      setSending(false);
    }
  }, [activeTier, authToken, history, input, proxyUrl, sending]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearChat = () => {
    setHistory([]);
    setChatError('');
  };

  const adminUrl = `${proxyUrl.replace(/\/$/, '')}/admin`;

  return (
    <div className="min-h-screen bg-navy-900 text-white relative">
      <ParticleCanvas />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue/30 to-accent-purple/30 border border-white/10 flex items-center justify-center">
              <FiZap className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
                Lab <span className="text-white/40 font-mono text-sm">/ free-claude-code</span>
              </h1>
              <p className="text-xs text-white/50 font-mono mt-0.5">remote control for your local fcc-server</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill state={status} latencyMs={latencyMs} />
            <button
              onClick={checkStatus}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition"
              title="Re-check"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={`p-2 rounded-lg border transition ${
                showSettings
                  ? 'bg-accent-blue/20 border-accent-blue/40 text-accent-cyan'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
              }`}
              title="Settings"
            >
              <FiSettings className="w-4 h-4" />
            </button>
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg transition"
            >
              ← Portfolio
            </Link>
          </div>
        </header>

        {showSettings && (
          <section className="mb-6 p-5 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider font-mono text-white/50">Proxy URL</span>
                <input
                  value={proxyUrl}
                  onChange={(e) => setProxyUrl(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm font-mono focus:outline-none focus:border-accent-blue/60"
                  placeholder="http://localhost:8082"
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider font-mono text-white/50">Auth Token</span>
                <input
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm font-mono focus:outline-none focus:border-accent-blue/60"
                  placeholder="freecc"
                />
              </label>
            </div>
            <p className="mt-3 text-xs text-white/40 font-mono">
              Stored only in your browser's localStorage. Never sent anywhere except your own proxy. Model tier is set via the Opus / Sonnet / Haiku pills above the chat.
            </p>
          </section>
        )}

        {status === 'offline' && (
          <section className="mb-6 p-5 rounded-xl border border-rose-500/30 bg-rose-500/[0.06]">
            <div className="flex items-start gap-3">
              <FiXCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold">Local proxy not reachable at <code className="font-mono text-rose-300">{proxyUrl}</code></h3>
                <p className="text-sm text-white/60 mt-1">
                  Start <code className="font-mono text-accent-cyan">fcc-server</code> on this machine. Install instructions are below.
                </p>
              </div>
            </div>
          </section>
        )}

        {status === 'cors' && (
          <section className="mb-6 p-5 rounded-xl border border-amber-500/30 bg-amber-500/[0.06]">
            <div className="flex items-start gap-3">
              <FiActivity className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold">Proxy is running but blocking this origin (CORS)</h3>
                <p className="text-sm text-white/60 mt-1">
                  Allow <code className="font-mono text-amber-200">{window.location.origin}</code> in <code className="font-mono">fcc-server</code>, or
                  open this Lab page locally (clone the portfolio) so the origin matches your loopback.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-heading font-semibold mb-3">
            <FiTerminal className="w-4 h-4 text-accent-emerald" />
            Quick start
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <CommandBlock label="Install (macOS / Linux)" command={INSTALL_COMMANDS.mac} />
            <CommandBlock label="Install (Windows PowerShell)" command={INSTALL_COMMANDS.win} />
            <CommandBlock label="Start the proxy" command={INSTALL_COMMANDS.start} />
            <CommandBlock label="Launch Claude Code CLI" command={INSTALL_COMMANDS.claude} />
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h2 className="flex items-center gap-2 text-lg font-heading font-semibold">
              <FiPower className="w-4 h-4 text-accent-purple" />
              Admin UI
              <span className="text-xs font-mono text-white/40 font-normal ml-1">(provider keys, model overrides)</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdminEmbed((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg transition"
                title={showAdminEmbed ? 'Hide embedded admin' : 'Embed admin UI inline (note: it polls every ~2s)'}
              >
                {showAdminEmbed ? 'Hide inline' : 'Embed inline'}
              </button>
              <a
                href={adminUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-accent-cyan bg-accent-blue/15 hover:bg-accent-blue/25 border border-accent-blue/30 rounded-lg transition"
              >
                Open in new tab <FiExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          {showAdminEmbed ? (
            <>
              <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
                {status === 'online' || status === 'cors' ? (
                  <iframe
                    title="fcc admin"
                    src={adminUrl}
                    className="w-full h-[520px] bg-white"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                  />
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-white/40 text-sm font-mono">
                    Admin UI will load once your local proxy is online.
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-white/40 font-mono">
                Heads up: this admin UI polls itself every ~2 seconds, which is why it constantly shows loading spinners. If it's distracting, click "Hide inline".
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-xs font-mono text-white/50">
                Hidden by default (admin polls itself constantly and makes the page twitchy). Open it in a new tab for a stable view, or embed it inline only when you need to change config.
              </p>
            </div>
          )}
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-lg font-heading font-semibold">
              <FiSend className="w-4 h-4 text-accent-cyan" />
              Quick chat
            </h2>
            {history.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs font-mono text-white/50 hover:text-white/80 px-2 py-1 rounded border border-white/10 hover:border-white/20 transition"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-white/10 self-start">
              {TIERS.map((t) => {
                const isActive = t.id === tierId;
                const s = TIER_BTN_STYLES[t.accent] || TIER_BTN_STYLES.blue;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTierId(t.id)}
                    disabled={sending}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      isActive ? s.active : s.idle
                    }`}
                    title={t.desc}
                  >
                    <span className="font-semibold">{t.label}</span>
                    <span className="hidden sm:inline ml-1.5 opacity-60">· {t.desc}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] font-mono text-white/40 self-start sm:self-auto">
              backed by <span className="text-white/60">{activeTier.backedBy}</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
            <div className="h-[360px] overflow-y-auto p-4 space-y-3">
              {history.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-white/40">
                  <FiSend className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Send a message to your local proxy.</p>
                  <p className="text-xs font-mono mt-1 text-white/30">POST {proxyUrl}/v1/messages</p>
                </div>
              )}
              {history.map((m, i) => (
                <div
                  key={i}
                  className={`group flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-sm break-words ${
                      m.role === 'user'
                        ? 'bg-accent-blue/20 border border-accent-blue/30 rounded-br-sm whitespace-pre-wrap'
                        : 'bg-white/[0.04] border border-white/10 rounded-bl-sm'
                    }`}
                  >
                    {m.role === 'user' ? (
                      m.content
                    ) : !m.content && m.streaming ? (
                      <span className="text-white/40 font-mono">thinking…</span>
                    ) : (
                      <div className="prose-invert leading-relaxed text-[13.5px]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {m.streaming && m.content && (
                      <span className="inline-block w-1.5 h-3.5 ml-0.5 align-text-bottom bg-accent-cyan/80 animate-pulse" />
                    )}
                    {m.role === 'assistant' && !m.streaming && m.content && (
                      <div className="mt-2 flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-mono text-white/30">{m.model || ''}</span>
                        <CopyButton text={m.content} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {chatError && (
              <div className="px-4 py-2 border-t border-rose-500/30 bg-rose-500/[0.08] text-xs font-mono text-rose-200 break-all">
                {chatError}
              </div>
            )}

            <div className="border-t border-white/10 p-3 flex items-end gap-2 bg-black/40">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder={status === 'online' ? 'Message your local proxy…  (Enter to send, Shift+Enter for newline)' : 'Start fcc-server first…'}
                disabled={status !== 'online'}
                className="flex-1 resize-none bg-transparent text-sm font-mono focus:outline-none placeholder:text-white/30 disabled:opacity-50 px-2 py-2 max-h-40"
              />
              {sending ? (
                <button
                  onClick={stopStreaming}
                  className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 transition inline-flex items-center gap-1.5 text-sm font-mono"
                  title="Stop streaming"
                >
                  <FiSquare className="w-3.5 h-3.5 fill-current" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  disabled={status !== 'online' || !input.trim()}
                  className="px-4 py-2 rounded-lg bg-accent-blue/20 hover:bg-accent-blue/30 border border-accent-blue/30 text-accent-cyan disabled:opacity-30 disabled:cursor-not-allowed transition inline-flex items-center gap-1.5 text-sm font-mono"
                >
                  <FiSend className="w-4 h-4" />
                  Send
                </button>
              )}
            </div>
          </div>
        </section>

        <footer className="text-center text-xs font-mono text-white/30 pb-8">
          built on{' '}
          <a
            href="https://github.com/Alishahryar1/free-claude-code"
            target="_blank"
            rel="noreferrer"
            className="text-white/50 hover:text-accent-cyan transition"
          >
            Alishahryar1/free-claude-code
          </a>
          {' · '}routes Claude Code traffic through your own provider keys
        </footer>
      </div>
    </div>
  );
}
