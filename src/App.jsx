import { useState, useEffect, useRef } from "react";

/* ─── Google Font injected once ─── */
const injectFont = () => {
  if (document.getElementById("sk-font")) return;
  const l = document.createElement("link");
  l.id   = "sk-font";
  l.rel  = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
};

/* ─── Data ─── */
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

/* ─── Helpers ─── */
const todayKey  = () => new Date().toISOString().slice(0, 10);
const store     = {
  get: (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const START = "2026-04-01";
const daysSince = () => Math.max(0, Math.floor((new Date() - new Date(START)) / 86400000));

/* ─── SVG Nav Icons ─── */
const IconHome    = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
      stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"}
      fill={active ? "rgba(255,255,255,0.08)" : "none"} strokeLinejoin="round"/>
    <path d="M9 21V12h6v9" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"} strokeLinejoin="round"/>
  </svg>
);
const IconFeed    = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"}/>
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"}/>
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"}/>
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={active ? "#fff" : "#555"} strokeWidth={active ? "1.8" : "1.5"}/>
  </svg>
);
const IconQuests  = ({ active }) => (
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

/* ══════════════════════════════════════════
   ROOT
══════════════════════════════════════════ */
export default function App() {
  injectFont();

  const [view, setView]           = useState("home");
  const [tasks, setTasks]         = useState({});
  const [logs, setLogs]           = useState({});
  const [quests, setQuests]       = useState({});
  const [streak, setStreak]       = useState(0);
  const [photo, setPhoto]         = useState(null);
  const [bio, setBio]             = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [prevView, setPrevView]   = useState("home");
  const fileRef = useRef();

  /* Load */
  useEffect(() => {
    const t = store.get("sk-tasks");
    const l = store.get("sk-logs")   ?? {};
    const q = store.get("sk-quests") ?? {};
    const p = store.get("sk-photo");
    const b = store.get("sk-bio")    ?? "";
    if (t?.date === todayKey()) setTasks(t.data ?? {});
    setLogs(l); setQuests(q);
    if (p) setPhoto(p);
    setBio(b);
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

  const navigate = (v) => { setPrevView(view); setView(v); };

  /* Actions */
  const toggleTask = (pillar, idx) => {
    const key  = `${pillar}-${idx}`;
    const next = { ...tasks, [key]: !tasks[key] };
    setTasks(next);
    store.set("sk-tasks", { date: todayKey(), data: next });
    const dayLog = {};
    PILLARS.forEach(p => {
      dayLog[p.id] = DAILY_TASKS[p.id].filter((_, i) => next[`${p.id}-${i}`]).length;
    });
    const nl = { ...logs, [todayKey()]: dayLog };
    setLogs(nl); store.set("sk-logs", nl);
  };

  const toggleQuest = (id) => {
    const next = { ...quests, [id]: !quests[id] };
    setQuests(next); store.set("sk-quests", next);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setPhoto(ev.target.result); store.set("sk-photo", ev.target.result); };
    reader.readAsDataURL(file);
  };

  const saveBio = (val) => { setBio(val); store.set("sk-bio", val); setEditingBio(false); };

  /* Computed */
  const totalDone  = Object.values(tasks).filter(Boolean).length;
  const totalTasks = PILLARS.length * 3;
  const questsDone = Object.values(quests).filter(Boolean).length;
  const daysLogged = Object.keys(logs).length;

  const pillarToday   = (id) => Math.round((DAILY_TASKS[id].filter((_,i) => tasks[`${id}-${i}`]).length / DAILY_TASKS[id].length) * 100);
  const pillarAllTime = (id) => daysLogged === 0 ? 0 : Math.round((Object.values(logs).reduce((a,d) => a+(d[id]??0),0) / (daysLogged * DAILY_TASKS[id].length)) * 100);
  const overall       = () => daysLogged === 0 ? 0 : Math.round((Object.values(logs).reduce((a,d) => a+PILLARS.reduce((s,p)=>s+(d[p.id]??0),0),0) / (daysLogged*totalTasks))*100);

  const todayPct = Math.round((totalDone / totalTasks) * 100);

  /* ── Shared token ── */
  const F = "DM Sans, system-ui, sans-serif";
  const MONO = "DM Mono, monospace";

  return (
    <div style={{ fontFamily: F, background: "#000", minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 430, position: "relative", minHeight: "100vh", background: "#000" }}>

        {/* ══ STATUS BAR SPACER ══ */}
        <div style={{ height: 48 }} />

        {/* ══ TOP BAR ══ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 16px" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>Seekers</div>
            <div style={{ fontSize: 12, color: "#555", letterSpacing: 0.3, marginTop: 1 }}>Luis's Stack</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, padding: "6px 12px" }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{streak}</span>
            <span style={{ fontSize: 11, color: "#555" }}>day{streak !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* ══ STAT STRIP ══ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "0 16px 20px" }}>
          {[
            { n: streak,     l: "Streak"   },
            { n: daysLogged, l: "Days"     },
            { n: totalDone,  l: "Today"    },
            { n: questsDone, l: "Quests"   },
          ].map(st => (
            <div key={st.l} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{st.n}</div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 2, letterSpacing: 0.5, textTransform: "uppercase" }}>{st.l}</div>
            </div>
          ))}
        </div>

        {/* ══ PAGE CONTENT ══ */}
        <div style={{ paddingBottom: 90, overflowY: "auto" }}>

          {/* ── HOME / TODAY ── */}
          {view === "home" && (
            <div style={{ padding: "0 16px" }}>

              {/* Daily ring summary */}
              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
                <RingChart pct={todayPct} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>Today's progress</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{todayPct}%</div>
                  <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{totalDone} of {totalTasks} tasks done</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                    {PILLARS.map(p => (
                      <div key={p.id} style={{ flex: 1, height: 3, borderRadius: 2, background: "#1a1a1a", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pillarToday(p.id)}%`, background: p.color, borderRadius: 2, transition: "width .4s ease" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pillars */}
              {PILLARS.map(pillar => (
                <div key={pillar.id} style={{ marginBottom: 24 }}>
                  {/* Pillar header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: pillar.color }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#e0ddd8", letterSpacing: 0.3, textTransform: "uppercase" }}>{pillar.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: pillar.color, fontFamily: MONO }}>{pillarToday(pillar.id)}%</span>
                  </div>

                  {/* Tasks */}
                  {DAILY_TASKS[pillar.id].map((task, i) => {
                    const key  = `${pillar.id}-${i}`;
                    const done = !!tasks[key];
                    return (
                      <div key={key} onClick={() => toggleTask(pillar.id, i)}
                        style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 14px", background: done ? "#0a0a0a" : "#0d0d0d", border: `1px solid ${done ? "#1a1a1a" : "#1e1e1e"}`, borderRadius: 14, marginBottom: 6, cursor: "pointer", transition: "all .15s", opacity: done ? 0.5 : 1 }}>
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

          {/* ── FEED (placeholder for v2) ── */}
          {view === "feed" && (
            <div style={{ padding: "0 16px" }}>
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Knowledge Feed</div>
                <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                  AI-generated philosophy drops, ideas on health, sports, goal-setting, and society. Coming in v2.
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTS ── */}
          {view === "quests" && (
            <div style={{ padding: "0 16px" }}>
              <div style={{ fontSize: 13, color: "#444", fontStyle: "italic", marginBottom: 20 }}>
                Locked challenges. Check it off only when you've truly done it.
              </div>
              {PILLARS.map(pillar => {
                const qs = SIDE_QUESTS.filter(q => q.pillar === pillar.id);
                const done = qs.filter(q => quests[q.id]).length;
                return (
                  <div key={pillar.id} style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: pillar.color }} />
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

          {/* ── PROFILE ── */}
          {view === "profile" && (
            <div style={{ padding: "0 16px" }}>

              {/* Avatar block */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 28, borderBottom: "1px solid #111", marginBottom: 24 }}>
                <div style={{ position: "relative", marginBottom: 14 }}
                  onClick={() => fileRef.current.click()}>
                  {photo
                    ? <img src={photo} alt="Luis" style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "2px solid #222" }}/>
                    : <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#111", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#fff", cursor: "pointer" }}>L</div>
                  }
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M9.5 1.5l2 2-7 7H2.5v-2l7-7z" stroke="#000" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto}/>
                </div>

                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>Luis</div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 3 }}>Seeker · Day {daysSince()}</div>

                {/* Bio */}
                <div style={{ width: "100%", marginTop: 14 }}>
                  {editingBio
                    ? <BioEditor initial={bio} onSave={saveBio} onCancel={() => setEditingBio(false)} F={F}/>
                    : <div onClick={() => setEditingBio(true)} style={{ fontSize: 14, color: bio ? "#c8c5be" : "#444", fontStyle: bio ? "normal" : "italic", lineHeight: 1.6, textAlign: "center", cursor: "text" }}>
                        {bio || "What are you seeking? Tap to write your bio."}
                      </div>
                  }
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {[
                  { n: `${overall()}%`, l: "Overall progress" },
                  { n: daysLogged,     l: "Days logged"       },
                  { n: streak,         l: "Current streak"    },
                  { n: questsDone,     l: "Quests completed"  },
                ].map(st => (
                  <div key={st.l} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, padding: "16px 14px" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>{st.n}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{st.l}</div>
                  </div>
                ))}
              </div>

              {/* Pillar bars */}
              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "18px 16px", marginBottom: 20 }}>
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
              <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 20, padding: "18px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
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
                <button key={tab.id} onClick={() => navigate(tab.id)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "transparent", border: "none", cursor: "pointer", padding: "8px 0", transition: "opacity .15s", opacity: active ? 1 : 0.7 }}>
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

      </div>
    </div>
  );
}

/* ── Ring chart ── */
function RingChart({ pct }) {
  const r = 28, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1a1a1a" strokeWidth="6"/>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#fff" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dashoffset .6s ease" }}/>
      <text x="36" y="40" textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "#fff", fontFamily: "DM Sans, system-ui" }}>{pct}%</text>
    </svg>
  );
}

/* ── Bio editor ── */
function BioEditor({ initial, onSave, onCancel, F }) {
  const [val, setVal] = useState(initial);
  return (
    <div>
      <textarea value={val} onChange={e => setVal(e.target.value)} placeholder="What are you seeking?"
        style={{ width: "100%", background: "#111", border: "1px solid #222", color: "#c8c5be", fontSize: 14, padding: "12px 14px", borderRadius: 12, resize: "none", minHeight: 80, fontFamily: F, outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}/>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => onSave(val)} style={{ flex: 1, fontSize: 13, fontWeight: 600, padding: "10px 0", background: "#fff", border: "none", color: "#000", cursor: "pointer", borderRadius: 10, fontFamily: F }}>Save</button>
        <button onClick={onCancel} style={{ flex: 1, fontSize: 13, fontWeight: 500, padding: "10px 0", background: "transparent", border: "1px solid #222", color: "#666", cursor: "pointer", borderRadius: 10, fontFamily: F }}>Cancel</button>
      </div>
    </div>
  );
}
