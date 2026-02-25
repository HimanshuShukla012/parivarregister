// src/components/admin/SystemDashboard.jsx
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Inject Google Font ───────────────────────────────────────────────────────
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
};

// ─── Mock data generator — replace with real API calls ───────────────────────
const generateStats = () => ({
  storage: {
    used: 1240 + Math.random() * 20,
    total: 2048,
    unit: "GB",
    trend: Math.random() > 0.5 ? "up" : "stable",
    delta: +(Math.random() * 2).toFixed(1),
  },
  database: {
    used: 38.4 + Math.random() * 1,
    total: 100,
    unit: "GB",
    trend: "up",
    delta: +(Math.random() * 0.5).toFixed(2),
    tables: 247,
    queryLoad: Math.round(120 + Math.random() * 80),
  },
  cpu: {
    usage: Math.round(28 + Math.random() * 40),
    cores: 16,
    freq: "3.4 GHz",
    temp: Math.round(48 + Math.random() * 20),
  },
  memory: {
    used: 11.2 + Math.random() * 2,
    total: 32,
    unit: "GB",
    cached: 4.8,
  },
  network: {
    inbound: +(12.4 + Math.random() * 8).toFixed(1),
    outbound: +(6.2 + Math.random() * 4).toFixed(1),
    unit: "MB/s",
    latency: Math.round(2 + Math.random() * 8),
  },
  users: {
    concurrent: Math.round(34 + Math.random() * 30),
    active_sessions: Math.round(40 + Math.random() * 35),
    peak_today: 142,
    new_today: Math.round(8 + Math.random() * 12),
  },
  uploads: {
    pending: Math.round(Math.random() * 8),
    processed_today: Math.round(180 + Math.random() * 40),
    failed: Math.round(Math.random() * 3),
    queue_size: Math.round(Math.random() * 15),
  },
  system: {
    uptime: "14d 06h 32m",
    status: "operational",
    last_backup: "2h 14m ago",
    version: "v2.4.1",
  },
});

// ─── Spark line generator ─────────────────────────────────────────────────────
const useSparkline = (value, length = 20) => {
  const history = useRef([]);
  useEffect(() => {
    history.current.push(value);
    if (history.current.length > length) history.current.shift();
  }, [value, length]);
  return [...history.current];
};

// ─── Radial gauge ─────────────────────────────────────────────────────────────
const RadialGauge = ({ pct, color, size = 90, strokeWidth = 7 }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const cx = size / 2;

  const trackColor =
    pct > 85 ? "#ef444420" : pct > 60 ? "#f59e0b20" : "#ffffff0a";
  const fillColor =
    pct > 85 ? "#ef4444" : pct > 60 ? "#f59e0b" : color;
  const glowColor =
    pct > 85 ? "rgba(239,68,68,0.5)" : pct > 60 ? "rgba(245,158,11,0.4)" : color + "55";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <defs>
        <filter id={`glow-${pct}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={fillColor}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 6px ${glowColor})`,
          transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </svg>
  );
};

// ─── Sparkline SVG ────────────────────────────────────────────────────────────
const Sparkline = ({ data, color, height = 28, width = 80 }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}88)` }}
      />
    </svg>
  );
};

// ─── Stat Tile (small) ────────────────────────────────────────────────────────
const MiniTile = ({ label, value, unit, icon, color, sub }) => (
  <div style={{ ...tileS.mini, borderColor: color + "22" }}>
    <div style={{ ...tileS.miniIcon, background: color + "15", color }}>
      {icon}
    </div>
    <div style={tileS.miniBody}>
      <div style={tileS.miniVal}>
        {value}
        {unit && <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "3px" }}>{unit}</span>}
      </div>
      <div style={tileS.miniLabel}>{label}</div>
      {sub && <div style={tileS.miniSub}>{sub}</div>}
    </div>
  </div>
);

const tileS = {
  mini: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid",
    borderRadius: "10px",
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "background 0.2s",
  },
  miniIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "16px",
  },
  miniBody: { flex: 1, minWidth: 0 },
  miniVal: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f1f5f9",
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 1.1,
  },
  miniLabel: {
    fontSize: "10px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginTop: "2px",
  },
  miniSub: {
    fontSize: "10px",
    color: "#475569",
    marginTop: "1px",
  },
};

// ─── Gauge Card ───────────────────────────────────────────────────────────────
const GaugeCard = ({ title, used, total, unit, color, icon, extra, sparkData }) => {
  const pct = Math.round((used / total) * 100);
  const statusText = pct > 85 ? "Critical" : pct > 60 ? "Warning" : "Healthy";
  const statusColor = pct > 85 ? "#ef4444" : pct > 60 ? "#f59e0b" : "#22c55e";

  return (
    <div style={gaugeS.card}>
      <div style={gaugeS.header}>
        <div style={{ ...gaugeS.iconBox, color, background: color + "15" }}>{icon}</div>
        <div>
          <div style={gaugeS.title}>{title}</div>
          <div style={{ ...gaugeS.status, color: statusColor }}>
            ● {statusText}
          </div>
        </div>
        <div style={gaugeS.sparkWrap}>
          <Sparkline data={sparkData} color={color} />
        </div>
      </div>

      <div style={gaugeS.body}>
        <div style={gaugeS.gaugeWrap}>
          <RadialGauge pct={pct} color={color} size={100} strokeWidth={8} />
          <div style={gaugeS.pctOverlay}>
            <span style={{ ...gaugeS.pctNum, color }}>{pct}%</span>
          </div>
        </div>
        <div style={gaugeS.stats}>
          <div style={gaugeS.statRow}>
            <span style={gaugeS.statLabel}>Used</span>
            <span style={gaugeS.statVal}>{used.toFixed(1)} {unit}</span>
          </div>
          <div style={gaugeS.statRow}>
            <span style={gaugeS.statLabel}>Free</span>
            <span style={{ ...gaugeS.statVal, color: "#22c55e" }}>
              {(total - used).toFixed(1)} {unit}
            </span>
          </div>
          <div style={gaugeS.statRow}>
            <span style={gaugeS.statLabel}>Total</span>
            <span style={gaugeS.statVal}>{total} {unit}</span>
          </div>
          {extra && extra.map((e, i) => (
            <div key={i} style={gaugeS.statRow}>
              <span style={gaugeS.statLabel}>{e.label}</span>
              <span style={{ ...gaugeS.statVal, color: e.color || "#94a3b8" }}>{e.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar */}
      <div style={gaugeS.barTrack}>
        <div style={{
          ...gaugeS.barFill,
          width: `${pct}%`,
          background: pct > 85
            ? "linear-gradient(90deg,#ef4444,#b91c1c)"
            : pct > 60
            ? "linear-gradient(90deg,#f59e0b,#d97706)"
            : `linear-gradient(90deg,${color},${color}cc)`,
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
};

const gaugeS = {
  card: {
    background: "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.8))",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    position: "relative",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  iconBox: {
    width: "38px",
    height: "38px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "18px",
  },
  title: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#e2e8f0",
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.3px",
  },
  status: {
    fontSize: "10px",
    fontWeight: 600,
    marginTop: "2px",
    letterSpacing: "0.5px",
  },
  sparkWrap: {
    marginLeft: "auto",
    opacity: 0.7,
  },
  body: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  gaugeWrap: {
    position: "relative",
    width: "100px",
    height: "100px",
    flexShrink: 0,
  },
  pctOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pctNum: {
    fontSize: "22px",
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  },
  stats: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: "11px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statVal: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#94a3b8",
    fontFamily: "'JetBrains Mono', monospace",
  },
  barTrack: {
    height: "3px",
    borderRadius: "2px",
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
  },
};

// ─── Activity Log Item ────────────────────────────────────────────────────────
const logTypes = {
  upload: { color: "#3b82f6", icon: "↑" },
  user: { color: "#22c55e", icon: "●" },
  warning: { color: "#f59e0b", icon: "⚠" },
  error: { color: "#ef4444", icon: "✕" },
  backup: { color: "#a78bfa", icon: "⟳" },
  system: { color: "#64748b", icon: "·" },
};

const LOG_MESSAGES = [
  { type: "user", msg: "New session started — ADO-0842" },
  { type: "upload", msg: "Bulk PDF upload completed — 14 files" },
  { type: "user", msg: "User SA-1203 authenticated" },
  { type: "backup", msg: "Incremental DB backup completed" },
  { type: "system", msg: "CPU throttle released — load normal" },
  { type: "upload", msg: "PDF processed — Sitapur block data" },
  { type: "warning", msg: "Storage usage crossed 60% threshold" },
  { type: "user", msg: "Force logout executed — OP-3310" },
  { type: "system", msg: "Health check passed — all services OK" },
  { type: "upload", msg: "5 PDFs queued for processing" },
  { type: "error", msg: "PDF parse error — corrupted file detected" },
  { type: "user", msg: "New session started — HQ-0021" },
  { type: "backup", msg: "Scheduled backup initiated" },
  { type: "system", msg: "Cache cleared — 1.2 GB freed" },
];

const useActivityLog = () => {
  const [log, setLog] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      time: new Date(Date.now() - (5 - i) * 45000),
      ...LOG_MESSAGES[i % LOG_MESSAGES.length],
    }))
  );
  const counter = useRef(100);

  useEffect(() => {
    const interval = setInterval(() => {
      const entry = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      setLog((prev) => [
        { id: ++counter.current, time: new Date(), ...entry },
        ...prev.slice(0, 19),
      ]);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  return log;
};

const fmt = (d) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

// ─── CPU Usage Bar ────────────────────────────────────────────────────────────
const CpuBar = ({ usage }) => {
  const color = usage > 80 ? "#ef4444" : usage > 60 ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ marginBottom: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          CPU Usage
        </span>
        <span style={{ fontSize: "12px", fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
          {usage}%
        </span>
      </div>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${usage}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: "3px",
          boxShadow: `0 0 8px ${color}66`,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
};

// ─── Network Card ─────────────────────────────────────────────────────────────
const NetworkCard = ({ net, inSpark, outSpark }) => (
  <div style={gaugeS.card}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
      <div style={{ ...gaugeS.iconBox, color: "#38bdf8", background: "#38bdf815" }}>⇅</div>
      <div>
        <div style={gaugeS.title}>Network I/O</div>
        <div style={{ fontSize: "10px", color: "#64748b" }}>Latency: <span style={{ color: "#22c55e", fontFamily: "monospace" }}>{net.latency}ms</span></div>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.1)", borderRadius: "8px", padding: "10px" }}>
        <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Inbound</div>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#38bdf8", fontFamily: "monospace" }}>{net.inbound}</div>
        <div style={{ fontSize: "10px", color: "#475569" }}>{net.unit}</div>
        <div style={{ marginTop: "6px" }}><Sparkline data={inSpark} color="#38bdf8" width={70} /></div>
      </div>
      <div style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.1)", borderRadius: "8px", padding: "10px" }}>
        <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Outbound</div>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#a78bfa", fontFamily: "monospace" }}>{net.outbound}</div>
        <div style={{ fontSize: "10px", color: "#475569" }}>{net.unit}</div>
        <div style={{ marginTop: "6px" }}><Sparkline data={outSpark} color="#a78bfa" width={70} /></div>
      </div>
    </div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const SystemDashboard = () => {
  const [stats, setStats] = useState(generateStats);
  const [tick, setTick] = useState(0);
  const log = useActivityLog();

  // Sparkline histories
  const cpuHist = useRef([]);
  const storHist = useRef([]);
  const dbHist = useRef([]);
  const memHist = useRef([]);
  const inHist = useRef([]);
  const outHist = useRef([]);
  const userHist = useRef([]);

  const pushHist = (ref, val, len = 20) => {
    ref.current.push(val);
    if (ref.current.length > len) ref.current.shift();
    return [...ref.current];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(generateStats());
      setTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Update histories on each stats change
  pushHist(cpuHist, stats.cpu.usage);
  pushHist(storHist, (stats.storage.used / stats.storage.total) * 100);
  pushHist(dbHist, (stats.database.used / stats.database.total) * 100);
  pushHist(memHist, (stats.memory.used / stats.memory.total) * 100);
  pushHist(inHist, stats.network.inbound);
  pushHist(outHist, stats.network.outbound);
  pushHist(userHist, stats.users.concurrent);

  const now = new Date().toLocaleString("en-IN", {
    weekday: "short", day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <>
      <FontLoader />
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .sys-card:hover {
          border-color: rgba(255,255,255,0.13) !important;
          background: linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,41,59,0.9)) !important;
        }
        .log-row { animation: fadeSlideIn 0.3s ease; }
        .live-dot { animation: blink 1.4s ease infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div style={ds.root}>
        {/* Subtle scanline overlay */}
        <div style={ds.scanOverlay} />

        {/* ── Header ── */}
        <div style={ds.header}>
          <div style={ds.headerLeft}>
            <div style={ds.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div>
              <h1 style={ds.title}>System Monitor</h1>
              <p style={ds.subtitle}>Infrastructure · Real-time · Admin</p>
            </div>
          </div>
          <div style={ds.headerRight}>
            <div style={ds.liveBadge}>
              <span className="live-dot" style={{ color: "#22c55e", fontSize: "10px" }}>●</span>
              <span>LIVE</span>
            </div>
            <div style={ds.clock}>{now}</div>
            <div style={{ ...ds.statusPill, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}>
              ● {stats.system.status.toUpperCase()}
            </div>
            <div style={ds.versionTag}>{stats.system.version}</div>
          </div>
        </div>

        {/* ── Top KPI strip ── */}
        <div style={ds.kpiStrip}>
          {[
            { label: "Concurrent Users", value: stats.users.concurrent, icon: "👥", color: "#22c55e", sub: `${stats.users.active_sessions} sessions` },
            { label: "Peak Today", value: stats.users.peak_today, icon: "📈", color: "#38bdf8", sub: "max concurrent" },
            { label: "New Today", value: stats.users.new_today, icon: "✦", color: "#a78bfa", sub: "logins" },
            { label: "Pending Uploads", value: stats.uploads.pending, icon: "⏳", color: "#f59e0b", sub: `${stats.uploads.queue_size} in queue` },
            { label: "Processed Today", value: stats.uploads.processed_today, icon: "✓", color: "#22c55e", sub: `${stats.uploads.failed} failed` },
            { label: "DB Queries/min", value: stats.database.queryLoad, icon: "⚡", color: "#f472b6", sub: `${stats.database.tables} tables` },
            { label: "CPU Temp", value: `${stats.cpu.temp}°C`, icon: "🌡", color: stats.cpu.temp > 70 ? "#ef4444" : "#f59e0b", sub: `${stats.cpu.cores} cores · ${stats.cpu.freq}` },
            { label: "System Uptime", value: stats.system.uptime, icon: "⏱", color: "#64748b", sub: `Backup: ${stats.system.last_backup}` },
          ].map((k, i) => (
            <MiniTile key={i} {...k} />
          ))}
        </div>

        {/* ── Main grid ── */}
        <div style={ds.mainGrid}>
          {/* Storage */}
          <div className="sys-card" style={ds.gaugeCell}>
            <GaugeCard
              title="Storage Occupancy"
              used={stats.storage.used}
              total={stats.storage.total}
              unit="GB"
              color="#f59e0b"
              icon="💾"
              sparkData={[...storHist.current]}
              extra={[
                { label: "Trend", value: `+${stats.storage.delta} GB/d`, color: "#f59e0b" },
              ]}
            />
          </div>

          {/* Database */}
          <div className="sys-card" style={ds.gaugeCell}>
            <GaugeCard
              title="DB Space Occupancy"
              used={stats.database.used}
              total={stats.database.total}
              unit="GB"
              color="#3b82f6"
              icon="🗄"
              sparkData={[...dbHist.current]}
              extra={[
                { label: "Tables", value: stats.database.tables, color: "#94a3b8" },
                { label: "Q/min", value: stats.database.queryLoad, color: "#f472b6" },
              ]}
            />
          </div>

          {/* Memory */}
          <div className="sys-card" style={ds.gaugeCell}>
            <GaugeCard
              title="Memory Usage"
              used={stats.memory.used}
              total={stats.memory.total}
              unit="GB"
              color="#a78bfa"
              icon="🧠"
              sparkData={[...memHist.current]}
              extra={[
                { label: "Cached", value: `${stats.memory.cached} GB`, color: "#64748b" },
              ]}
            />
          </div>

          {/* Network */}
          <div className="sys-card" style={ds.gaugeCell}>
            <NetworkCard
              net={stats.network}
              inSpark={[...inHist.current]}
              outSpark={[...outHist.current]}
            />
          </div>

          {/* CPU */}
          <div className="sys-card" style={{ ...ds.gaugeCell, gridColumn: "span 2" }}>
            <div style={{ ...gaugeS.card, height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ ...gaugeS.iconBox, color: "#22c55e", background: "#22c55e15" }}>⚙</div>
                <div>
                  <div style={gaugeS.title}>CPU Performance</div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>{stats.cpu.cores} cores · {stats.cpu.freq}</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <Sparkline data={[...cpuHist.current]} color="#22c55e" width={100} />
                </div>
              </div>
              <CpuBar usage={stats.cpu.usage} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "12px" }}>
                {["User", "System", "I/O Wait", "Idle"].map((label, i) => {
                  const vals = [
                    Math.round(stats.cpu.usage * 0.6),
                    Math.round(stats.cpu.usage * 0.3),
                    Math.round(stats.cpu.usage * 0.1),
                    100 - stats.cpu.usage,
                  ];
                  const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#334155"];
                  return (
                    <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "8px 4px" }}>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: colors[i], fontFamily: "monospace" }}>{vals[i]}%</div>
                      <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Users sparkline card */}
          <div className="sys-card" style={{ ...ds.gaugeCell, gridColumn: "span 2" }}>
            <div style={gaugeS.card}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ ...gaugeS.iconBox, color: "#22c55e", background: "#22c55e15" }}>👤</div>
                <div style={gaugeS.title}>Concurrent Users — Live</div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="live-dot" style={{ color: "#22c55e", fontSize: "8px" }}>●</span>
                  <span style={{ fontSize: "22px", fontWeight: 700, color: "#22c55e", fontFamily: "monospace" }}>
                    {stats.users.concurrent}
                  </span>
                </div>
              </div>
              <Sparkline data={[...userHist.current]} color="#22c55e" width={460} height={50} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                {["Active Sessions", "Peak Today", "New Logins", "Force Logouts"].map((l, i) => {
                  const vals = [stats.users.active_sessions, stats.users.peak_today, stats.users.new_today, Math.round(Math.random() * 3)];
                  return (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", fontFamily: "monospace" }}>{vals[i]}</div>
                      <div style={{ fontSize: "10px", color: "#475569" }}>{l}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Activity Log ── */}
        <div style={ds.logSection}>
          <div style={ds.logHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#64748b", fontSize: "12px", fontFamily: "monospace" }}>$</span>
              <span style={ds.logTitle}>System Activity Log</span>
              <span className="live-dot" style={{ color: "#22c55e", fontSize: "9px", marginLeft: "4px" }}>●</span>
            </div>
            <span style={ds.logCount}>{log.length} events</span>
          </div>
          <div style={ds.logBody}>
            {log.map((entry, i) => {
              const t = logTypes[entry.type] || logTypes.system;
              return (
                <div key={entry.id} className="log-row" style={{
                  ...ds.logRow,
                  opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.04),
                  borderLeftColor: i === 0 ? t.color : "transparent",
                }}>
                  <span style={{ ...ds.logIcon, color: t.color }}>{t.icon}</span>
                  <span style={ds.logTime}>{fmt(entry.time)}</span>
                  <span style={{ ...ds.logType, color: t.color }}>[{entry.type.toUpperCase()}]</span>
                  <span style={ds.logMsg}>{entry.msg}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

const ds = {
  root: {
    background: "linear-gradient(160deg, #060d1a 0%, #0a1628 50%, #060d1a 100%)",
    minHeight: "100vh",
    padding: "20px 24px 32px",
    fontFamily: "'Syne', system-ui, sans-serif",
    color: "#e2e8f0",
    position: "relative",
    overflow: "hidden",
  },
  scanOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255,255,255,0.012) 2px,
      rgba(255,255,255,0.012) 4px
    )`,
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    position: "relative",
    zIndex: 1,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoIcon: {
    width: "44px",
    height: "44px",
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.2)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
    fontFamily: "'Syne', sans-serif",
  },
  subtitle: {
    margin: "2px 0 0",
    fontSize: "11px",
    color: "#334155",
    letterSpacing: "2px",
    textTransform: "uppercase",
    fontFamily: "'JetBrains Mono', monospace",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#22c55e",
    letterSpacing: "1px",
    fontFamily: "'JetBrains Mono', monospace",
    background: "rgba(34,197,94,0.08)",
    padding: "4px 10px",
    borderRadius: "4px",
    border: "1px solid rgba(34,197,94,0.2)",
  },
  clock: {
    fontSize: "11px",
    color: "#475569",
    fontFamily: "'JetBrains Mono', monospace",
    padding: "4px 10px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  statusPill: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1px",
    padding: "4px 10px",
    borderRadius: "4px",
    fontFamily: "monospace",
  },
  versionTag: {
    fontSize: "10px",
    color: "#334155",
    fontFamily: "'JetBrains Mono', monospace",
    padding: "4px 8px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "4px",
  },
  kpiStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "16px",
    position: "relative",
    zIndex: 1,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "16px",
    position: "relative",
    zIndex: 1,
  },
  gaugeCell: {
    transition: "border-color 0.2s, background 0.2s",
  },
  logSection: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
  },
  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    background: "rgba(255,255,255,0.02)",
  },
  logTitle: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontFamily: "'JetBrains Mono', monospace",
  },
  logCount: {
    fontSize: "10px",
    color: "#334155",
    fontFamily: "'JetBrains Mono', monospace",
  },
  logBody: {
    maxHeight: "220px",
    overflowY: "auto",
    padding: "6px 0",
  },
  logRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 16px",
    borderLeft: "2px solid transparent",
    transition: "all 0.2s",
  },
  logIcon: {
    width: "16px",
    textAlign: "center",
    flexShrink: 0,
    fontSize: "12px",
  },
  logTime: {
    fontSize: "10px",
    color: "#334155",
    fontFamily: "'JetBrains Mono', monospace",
    flexShrink: 0,
    width: "80px",
  },
  logType: {
    fontSize: "10px",
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    flexShrink: 0,
    width: "80px",
    letterSpacing: "0.3px",
  },
  logMsg: {
    fontSize: "12px",
    color: "#64748b",
    flex: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

export default SystemDashboard;