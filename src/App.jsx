import { useState, useEffect, useRef } from "react";

const injectFont = () => {
  if (document.getElementById("sk-font")) return;
  const l = document.createElement("link");
  l.id = "sk-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
};

const PILLARS = [
  { id: "knowledge", label: "Knowledge", color: "#5B9CF6", dim: "#1a2744" },
  { id: "peace",     label: "Peace",     color: "#C084FC", dim: "#2a1744" },
  { id: "build",     label: "Build",     color: "#FB923C", dim: "#2d1600" },
  { id: "sports",    label: "Sports",    color: "#34D399", dim: "#0d2820" },
];

const DAILY_TASKS = {
  knowledge: [
    "Read 15+ pages of a non-fiction book",
    "Study one concept deeply for 20 min",
    "Write one insight you learned today",
  ],
  peace: [
    "10-minute meditation — no phone before this",
    "Write 3 intentions for the day",
    "5-minute evening reflection",
  ],
  build: [
    "30-minute focused build sprint",
    "Ship or improve one feature",
    "Review what you built — honest assessment",
  ],
  sports: [
    "Train hard — track one metric to beat",
    "Cold exposure or mobility work",
    "Log your performance honestly",
  ],
};

const SIDE_QUESTS = [
  { id:"q1",  pillar:"knowledge", title:"Read 1 full book",                   deadline:"Apr 14" },
  { id:"q2",  pillar:"peace",     title:"7-day meditation streak — no skips", deadline:"Apr 7"  },
  { id:"q3",  pillar:"build",     title:"Ship Seekers to a real URL",          deadline:"Apr 21" },
  { id:"q4",  pillar:"sports",    title:"Hit a personal record",               deadline:"Apr 14" },
  { id:"q5",  pillar:"knowledge", title:"Write a 500-word essay on learnings", deadline:"Apr 30" },
  { id:"q6",  pillar:"peace",     title:"One full day of digital silence",     deadline:"May 10" },
  { id:"q7",  pillar:"build",     title:"Get 10 real people using Seekers",    deadline:"May 20" },
  { id:"q8",  pillar:"sports",    title:"Complete a new physical challenge",   deadline:"May 15" },
  { id:"q9",  pillar:"knowledge", title:"Finish a second book",                deadline:"May 31" },
  { id:"q10", pillar:"peace",     title:"One week of cold exposure mornings",  deadline:"Jun 10" },
  { id:"q11", pillar:"build",     title:"Publish something publicly",          deadline:"Jun 1"  },
  { id:"q12", pillar:"sports",    title:"Run 5K under your target time",       deadline:"Jun 7"  },
  { id:"q13", pillar:"peace",     title:"24hr no-phone challenge",             deadline:"Jun 20" },
  { id:"q14", pillar:"build",     title:"Launch on ProductHunt or Reddit",     deadline:"Jun 28" },
  { id:"q15", pillar:"knowledge", title:"Read 3 books total",                  deadline:"Jun 30" },
];

const todayKey  = () => new Date().toISOString().slice(0, 10);
const store     = {
  get: (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const START = "2026-04-01";
const daysSince = () => Math.max(0, Math.floor((new Date() - new Date(START)) / 86400000));

/* ── Icons ── */
const IconHome = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
      stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"}
      fill={active ? "rgba(255,255,255,0.08)" : "none"} strokeLinejoin="round"/>
    <path d="M9 21V12h6v9" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"} strokeLinejoin="round"/>
  </svg>
);
const IconFeed = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"}/>
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"}/>
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"}/>
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"}/>
  </svg>
);
const IconQuests = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9 11l3 3L22 4" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round"/>
  </svg>
);
const IconProfile = ({ active, photo }) => photo ? (
  <img src={photo} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", border: active ? "2px solid #fff" : "2px solid #333" }}/>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"}/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"} strokeLinecap="round"/>
  </svg>
);
const IconIncognito = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke={active ? "#C084FC" : "#555"} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke={active ? "#C084FC" : "#555"} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M1 1l22 22" stroke={active ? "#C084FC" : "#555"} strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

/* ══ INLINE EDITOR ══ */
function InlineEdit({ value, placeholder, onSave, style, multiline = false, F }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(value);
  useEffect(() => setVal(value), [value]);

  if (editing) {
    const shared = {
      value: val, onChange: e => setVal(e.target.value),
      placeholder,
      style: { width: "100%", background: "#111", border: "1px solid #2a2a2a", color: "#e0ddd8", fontSize: 14, padding: "10px 12px", borderRadius: 10, fontFamily: F, outline: "none", lineHeight: 1.6, boxSizing: "border-box", ...style },
    };
    return (
      <div onClick={e => e.stopPropagation()}>
        {multiline
          ? <textarea {...shared} rows={3} style={{ ...shared.style, resize: "none" }}/>
          : <input {...shared} type="text"/>
        }
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button onClick={() => { onSave(val); setEditing(false); }}
            style={{ fontSize: 12, fontWeight: 600, padding: "7px 16px", background: "#fff", border: "none", color: "#000", cursor: "pointer", borderRadius: 8, fontFamily: F }}>
            Save
          </button>
          <button onClick={() => { setVal(value); setEditing(false); }}
            style={{ fontSize: 12, padding: "7px 14px", background: "transparent", border: "1px solid #222", color: "#666", cursor: "pointer", borderRadius: 8, fontFamily: F }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
  return (
    <div onClick={() => setEditing(true)} style={{ cursor: "text" }}>
      {value
        ? <span style={style}>{value}</span>
        : <span style={{ ...style, color: "#444", fontStyle: "italic" }}>{placeholder}</span>
      }
    </div>
  );
}

/* ══ RING CHART ══ */
function RingChart({ pct }) {
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1a1a1a" strokeWidth="6"/>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#fff" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
        strokeLinecap="round" transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dashoffset .6s ease" }}/>
      <text x="36" y="40" textAnchor="middle"
        style={{ fontSize: 13, fontWeight: 700, fill: "#fff", fontFamily: "DM Sans, system-ui" }}>
        {pct}%
      </text>
    </svg>
  );
}

/* ══ PINNED NOTE CARD ══ */
function PinnedNote({ note, pillarColor, onEdit, onClear, F }) {
  if (!note) return (
    <div onClick={onEdit} style={{ border: "1px dashed #222", borderRadius: 16, padding: "16px 18px", cursor: "pointer", marginBottom: 20 }}>
      <div style={{ fontSize: 13, color: "#444", fontStyle: "italic" }}>
        + Pin a quote or idea to your profile
      </div>
    </div>
  );
  return (
    <div style={{ position: "relative", borderLeft: `3px solid ${pillarColor || "#5B9CF6"}`, background: "#0a0a0a", borderRadius: "0 16px 16px 0", padding: "16px 18px", marginBottom: 20 }}>
      <div style={{ fontSize: 15, color: "#e0ddd8", lineHeight: 1.65, fontStyle: "italic", fontWeight: 300 }}>
        "{note}"
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={onEdit}
          style={{ fontSize: 11, color: "#555", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: F }}>
          Edit
        </button>
        <button onClick={onClear}
          style={{ fontSize: 11, color: "#555", background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: F }}>
          Remove
        </button>
      </div>
    </div>
  );
}

/* ══ PIN NOTE MODAL ══ */
function PinNoteModal({ initial, onSave, onClose, F }) {
  const [val, setVal] = useState(initial ?? "");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 430, background: "#111", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", boxSizing: "border-box" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 20px" }}/>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Pin a note to your profile</div>
        <div style={{ fontSize: 13, color: "#555", marginBottom: 16 }}>A quote, an idea, something that defines this season.</div>
        <textarea value={val} onChange={e => setVal(e.target.value)}
          placeholder="e.g. The obstacle is the way."
          rows={4}
          style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#e0ddd8", fontSize: 15, padding: "12px 14px", borderRadius: 12, fontFamily: F, outline: "none", lineHeight: 1.7, resize: "none", boxSizing: "border-box", fontStyle: "italic" }}/>
        <button onClick={() => { onSave(val); onClose(); }}
          style={{ width: "100%", marginTop: 12, fontSize: 14, fontWeight: 600, padding: "14px 0", background: "#fff", border: "none", color: "#000", cursor: "pointer", borderRadius: 12, fontFamily: F }}>
          Pin it
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════ */
export default function App() {
  injectFont();
  const F    = "DM Sans, system-ui, sans-serif";
  const MONO = "DM Mono, monospace";

  const [view, setView]         = useState("home");
  const [tasks, setTasks]       = useState({});
  const [logs, setLogs]         = useState({});
  const [quests, setQuests]     = useState({});
  const [streak, setStreak]     = useState(0);
  const [photo, setPhoto]       = useState(null);
  const [bio, setBio]           = useState("");
  const [tagline, setTagline]   = useState("");
  const [obsession, setObsession] = useState("");
  const [pinnedNote, setPinnedNote] = useState("");
  const [pinnedColor, setPinnedColor] = useState("#5B9CF6");
  const [incognito, setIncognito] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const fileRef = useRef();

  /* Load */
  useEffect(() => {
    const t = store.get("sk-tasks");
    const l = store.get("sk-logs")    ?? {};
    const q = store.get("sk-quests")  ?? {};
    if (t?.date === todayKey()) setTasks(t.data ?? {});
    setLogs(l); setQuests(q);
    const p = store.get("sk-photo");       if (p) setPhoto(p);
    const b = store.get("sk-bio")   ?? ""; setBio(b);
    const tg = store.get("sk-tagline") ?? ""; setTagline(tg);
    const ob = store.get("sk-obsession") ?? ""; setObsession(ob);
    const pn = store.get("sk-pinned") ?? ""; setPinnedNote(pn);
    const pc = store.get("sk-pinnedcolor") ?? "#5B9CF6"; setPinnedColor(pc);
    const ig = store.get("sk-incognito") ?? false; setIncognito(ig);
  }, []);

  /* Streak */
  useEffect(() => {
    let s = 0;
    const d = new Date(); d.setDate(d.getDate() - 1);
    while (true) {
      const k = d.toISOString().slice(0, 10);
      const e = logs[k];
      if (!e || Object.values(e).every(v => v === 0)) break;
      s++; d.setDate(d.getDate() - 1);
    }
    setStreak(s);
  }, [logs]);

  /* Persist helpers */
  const saveBio       = v => { setBio(v);        store.set("sk-bio", v); };
  const saveTagline   = v => { setTagline(v);    store.set("sk-tagline", v); };
  const saveObsession = v => { setObsession(v);  store.set("sk-obsession", v); };
  const savePinned    = v => { setPinnedNote(v); store.set("sk-pinned", v); };
  const clearPinned   = () => { setPinnedNote(""); store.set("sk-pinned", ""); };
  const toggleIncognito = () => {
    const next = !incognito; setIncognito(next); store.set("sk-incognito", next);
  };

  const handlePhoto = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setPhoto(ev.target.result); store.set("sk-photo", ev.target.result); };
    reader.readAsDataURL(file);
  };

  /* Actions */
  const toggleTask = (pillar, idx) => {
    const key  = `${pillar}-${idx}`;
    const next = { ...tasks, [key]: !tasks[key] };
    setTasks(next); store.set("sk-tasks", { date: todayKey(), data: next });
    const dayLog = {};
    PILLARS.forEach(p => {
      dayLog[p.id] = DAILY_TASKS[p.id].filter((_, i) => next[`${p.id}-${i}`]).length;
    });
    const nl = { ...logs, [todayKey()]: dayLog };
    setLogs(nl); store.set("sk-logs", nl);
  };

  const toggleQuest = id => {
    const next = { ...quests, [id]: !quests[id] };
    setQuests(next); store.set("sk-quests", next);
  };

  /* Computed */
  const totalDone  = Object.values(tasks).filter(Boolean).length;
  const totalTasks = PILLARS.length * 3;
  const questsDone = Object.values(quests).filter(Boolean).length;
  const daysLogged = Object.keys(logs).length;
  const todayPct   = Math.round((totalDone / totalTasks) * 100);

  const pillarToday   = id => Math.round((DAILY_TASKS[id].filter((_,i) => tasks[`${id}-${i}`]).length / DAILY_TASKS[id].length) * 100);
  const pillarAllTime = id => daysLogged === 0 ? 0 : Math.round((Object.values(logs).reduce((a,d) => a+(d[id]??0),0) / (daysLogged * DAILY_TASKS[id].length)) * 100);
  const overall       = () => daysLogged === 0 ? 0 : Math.round((Object.values(logs).reduce((a,d) => a+PILLARS.reduce((s,p)=>s+(d[p.id]??0),0),0) / (daysLogged*totalTasks))*100);

  return (
    <div style={{ fontFamily: F, background: "#000", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 430, position: "relative", minHeight: "100vh", background: "#000" }}>

        {/* Status bar spacer */}
        <div style={{ height: 48 }}/>

        {/* ── TOP BAR ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 16px" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>Seekers</div>
            <div style={{ fontSize: 12, color: "#555", letterSpacing: 0.3, marginTop: 1 }}>Luis's Stack</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Incognito toggle */}
            <button onClick={toggleIncognito}
              style={{ display: "flex", alignItems: "center", gap: 5, background: incognito ? "#1a0d2e" : "#111", border: `1px solid ${incognito ? "#C084FC44" : "#1e1e1e"}`, borderRadius: 20, padding: "6px 10px", cursor: "pointer" }}>
              <IconIncognito active={incognito}/>
              {incognito && <span style={{ fontSize: 10, color: "#C084FC", fontFamily: MONO, letterSpacing: 0.5 }}>private</span>}
            </button>
            {/* Streak */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: "6px 12px" }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              {incognito
                ? <span style={{ fontSize: 13, color: "#555" }}>—</span>
                : <><span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{streak}</span>
                   <span style={{ fontSize: 11, color: "#555" }}>day{streak !== 1 ? "s" : ""}</span></>
              }
            </div>
          </div>
        </div>

        {/* ── STAT STRIP ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "0 16px 20px" }}>
          {[
            { n: streak,     l: "Streak"  },
            { n: daysLogged, l: "Days"    },
            { n: totalDone,  l: "Today"   },
            { n: questsDone, l: "Quests"  },
          ].map(st => (
            <div key={st.l} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: incognito && (st.l === "Streak" || st.l === "Days") ? "#333" : "#fff", filter: incognito && (st.l === "Streak" || st.l === "Days") ? "blur(6px)" : "none", transition: "all .3s", userSelect: incognito ? "none" : "auto" }}>
                {st.n}
              </div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 2, letterSpacing: 0.5, textTransform: "uppercase" }}>{st.l}</div>
            </div>
          ))}
        </div>

        {/* ── PAGE CONTENT ── */}
        <div style={{ paddingBottom: 90 }}>

          {/* HOME */}
          {view === "home" && (
            <div style={{ padding: "0 16px" }}>
              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
                <RingChart pct={todayPct}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Today's progress</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{todayPct}%</div>
                  <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{totalDone} of {totalTasks} tasks done</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                    {PILLARS.map(p => (
                      <div key={p.id} style={{ flex: 1, height: 3, borderRadius: 2, background: "#1a1a1a", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pillarToday(p.id)}%`, background: p.color, borderRadius: 2, transition: "width .4s ease" }}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {PILLARS.map(pillar => (
                <div key={pillar.id} style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: pillar.color }}/>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e0ddd8", letterSpacing: 0.3, textTransform: "uppercase" }}>{pillar.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: pillar.color, fontFamily: MONO }}>{pillarToday(pillar.id)}%</span>
                  </div>
                  {DAILY_TASKS[pillar.id].map((task, i) => {
                    const key  = `${pillar.id}-${i}`;
                    const done = !!tasks[key];
                    return (
                      <div key={key} onClick={() => toggleTask(pillar.id, i)}
                        style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 14px", background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 14, marginBottom: 6, cursor: "pointer", opacity: done ? 0.45 : 1, transition: "opacity .15s" }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${done ? pillar.color : "#333"}`, background: done ? pillar.color : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                          {done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                        </div>
                        <span style={{ fontSize: 14, color: done ? "#444" : "#c8c5be", lineHeight: 1.45, textDecoration: done ? "line-through" : "none", flex: 1 }}>{task}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* FEED */}
          {view === "feed" && (
            <div style={{ padding: "0 16px", textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>✦</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Knowledge Feed</div>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                AI-generated philosophy, health, sport science and ideas — curated to your pillars. Coming in v2.
              </div>
            </div>
          )}

          {/* QUESTS */}
          {view === "quests" && (
            <div style={{ padding: "0 16px" }}>
              <div style={{ fontSize: 13, color: "#444", fontStyle: "italic", marginBottom: 20 }}>
                Locked challenges. Check it off only when you've truly done it.
              </div>
              {PILLARS.map(pillar => {
                const qs   = SIDE_QUESTS.filter(q => q.pillar === pillar.id);
                const done = qs.filter(q => quests[q.id]).length;
                return (
                  <div key={pillar.id} style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: pillar.color }}/>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#e0ddd8", textTransform: "uppercase", letterSpacing: 0.3 }}>{pillar.label}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#444", fontFamily: MONO }}>{done}/{qs.length}</span>
                    </div>
                    {qs.map(q => {
                      const d = !!quests[q.id];
                      return (
                        <div key={q.id} onClick={() => toggleQuest(q.id)}
                          style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 14px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, marginBottom: 6, cursor: "pointer", opacity: d ? 0.4 : 1, transition: "opacity .15s" }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${d ? pillar.color : "#333"}`, background: d ? pillar.color : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}>
                            {d && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, color: d ? "#444" : "#c8c5be", textDecoration: d ? "line-through" : "none", lineHeight: 1.4 }}>{q.title}</div>
                            <div style={{ fontSize: 11, color: "#444", marginTop: 4, fontFamily: MONO }}>Due {q.deadline}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* PROFILE */}
          {view === "profile" && (
            <div style={{ padding: "0 16px" }}>

              {/* Avatar + identity */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 24, borderBottom: "1px solid #111", marginBottom: 24 }}>
                {/* Avatar */}
                <div style={{ position: "relative", marginBottom: 14 }} onClick={() => fileRef.current.click()}>
                  {photo
                    ? <img src={photo} alt="Luis" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "2px solid #222", cursor: "pointer" }}/>
                    : <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#111", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700, color: "#fff", cursor: "pointer" }}>L</div>
                  }
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M9.5 1.5l2 2-7 7H2.5v-2l7-7z" stroke="#000" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto}/>
                </div>

                {/* Name */}
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.3, marginBottom: 4 }}>Luis</div>

                {/* Tagline — editable mantra */}
                <InlineEdit
                  value={tagline}
                  placeholder="Your seeking in 3–5 words…"
                  onSave={saveTagline}
                  F={F}
                  style={{ fontSize: 13, color: "#555", letterSpacing: 0.3, textAlign: "center" }}
                />

                {/* Seeker since */}
                <div style={{ fontSize: 11, color: "#333", marginTop: 6 }}>Seeker · Day {daysSince()}</div>

                {/* Bio — editable */}
                <div style={{ width: "100%", marginTop: 16 }}>
                  <InlineEdit
                    value={bio}
                    placeholder="What are you seeking? Tap to write your bio."
                    onSave={saveBio}
                    multiline
                    F={F}
                    style={{ fontSize: 14, color: "#c8c5be", lineHeight: 1.6, textAlign: "center" }}
                  />
                </div>

                {/* Current obsession */}
                <div style={{ width: "100%", marginTop: 16, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, padding: "10px 14px" }}>
                  <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Current obsession</div>
                  <InlineEdit
                    value={obsession}
                    placeholder="What are you deep into right now?"
                    onSave={saveObsession}
                    F={F}
                    style={{ fontSize: 14, color: "#e0ddd8", fontWeight: 500 }}
                  />
                </div>
              </div>

              {/* Pinned note */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Pinned</div>
                <PinnedNote
                  note={pinnedNote}
                  pillarColor={pinnedColor}
                  onEdit={() => setShowPinModal(true)}
                  onClear={clearPinned}
                  F={F}
                />
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { n: `${overall()}%`, l: "Overall progress", blur: false },
                  { n: daysLogged,      l: "Days logged",       blur: incognito },
                  { n: streak,          l: "Current streak",    blur: incognito },
                  { n: questsDone,      l: "Quests completed",  blur: false },
                ].map(st => (
                  <div key={st.l} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, padding: "16px 14px" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", filter: st.blur ? "blur(8px)" : "none", transition: "filter .3s", userSelect: st.blur ? "none" : "auto" }}>{st.n}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{st.l}</div>
                  </div>
                ))}
              </div>

              {/* Pillar bars */}
              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "18px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Luis's Stack</div>
                {PILLARS.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, color: "#888", minWidth: 80 }}>{p.label}</span>
                    <div style={{ flex: 1, height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pillarAllTime(p.id)}%`, background: p.color, borderRadius: 2, transition: "width .5s ease" }}/>
                    </div>
                    <span style={{ fontSize: 11, color: "#555", minWidth: 32, textAlign: "right", fontFamily: MONO }}>{pillarAllTime(p.id)}%</span>
                  </div>
                ))}
              </div>

              {/* Quest dots */}
              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "18px 16px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Side Quests</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: MONO }}>{questsDone}/{SIDE_QUESTS.length}</div>
                </div>
                <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, marginBottom: 14, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(questsDone/SIDE_QUESTS.length)*100}%`, background: "#C084FC", borderRadius: 2, transition: "width .5s ease" }}/>
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {SIDE_QUESTS.map(q => {
                    const pc = PILLARS.find(p => p.id === q.pillar)?.color;
                    return (
                      <div key={q.id} style={{ width: 11, height: 11, borderRadius: "50%", background: quests[q.id] ? pc : "#1a1a1a", border: `1px solid ${quests[q.id] ? pc : "#2a2a2a"}`, transition: "all .3s" }}/>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ══ BOTTOM NAV ══ */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(0,0,0,0.92)", borderTop: "1px solid #111", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "8px 0 4px" }}>
            {[
              { id: "home",    label: "Home",    Icon: IconHome    },
              { id: "feed",    label: "Feed",    Icon: IconFeed    },
              { id: "quests",  label: "Quests",  Icon: IconQuests  },
              { id: "profile", label: "Profile", Icon: IconProfile },
            ].map(tab => {
              const active = view === tab.id;
              return (
                <button key={tab.id} onClick={() => setView(tab.id)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", padding: "8px 0", opacity: active ? 1 : 0.6, transition: "opacity .15s" }}>
                  {tab.id === "profile"
                    ? <IconProfile active={active} photo={photo}/>
                    : <tab.Icon active={active}/>
                  }
                  <span style={{ fontSize: 10, color: active ? "#fff" : "#555", fontFamily: F, fontWeight: active ? 600 : 400, letterSpacing: 0.3, transition: "color .15s" }}>
                    {tab.label}
                  </span>
                  {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff", marginTop: -2 }}/>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ PIN NOTE MODAL ══ */}
        {showPinModal && (
          <PinNoteModal
            initial={pinnedNote}
            onSave={val => { savePinned(val); }}
            onClose={() => setShowPinModal(false)}
            F={F}
          />
        )}

      </div>
    </div>
  );
}
