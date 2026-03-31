import { useState, useEffect, useRef } from "react";

const PILLARS = [
  { id: "knowledge", label: "Knowledge", emoji: "◈", color: "#4A90E2" },
  { id: "peace",     label: "Peace",     emoji: "◎", color: "#A78BFA" },
  { id: "build",     label: "Build",     emoji: "◆", color: "#F97316" },
  { id: "sports",    label: "Sports",    emoji: "◉", color: "#22C55E" },
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
  { id: "q1",  pillar: "knowledge", title: "Read 1 full book",                   deadline: "Apr 14" },
  { id: "q2",  pillar: "peace",     title: "7-day meditation streak — no skips", deadline: "Apr 7"  },
  { id: "q3",  pillar: "build",     title: "Ship Seekers to a real URL",          deadline: "Apr 21" },
  { id: "q4",  pillar: "sports",    title: "Hit a personal record",               deadline: "Apr 14" },
  { id: "q5",  pillar: "knowledge", title: "Write a 500-word essay on learnings", deadline: "Apr 30" },
  { id: "q6",  pillar: "peace",     title: "One full day of digital silence",     deadline: "May 10" },
  { id: "q7",  pillar: "build",     title: "Get 10 real people using Seekers",    deadline: "May 20" },
  { id: "q8",  pillar: "sports",    title: "Complete a new physical challenge",   deadline: "May 15" },
  { id: "q9",  pillar: "knowledge", title: "Finish a second book",                deadline: "May 31" },
  { id: "q10", pillar: "peace",     title: "One week of cold exposure mornings",  deadline: "Jun 10" },
  { id: "q11", pillar: "build",     title: "Publish something publicly",          deadline: "Jun 1"  },
  { id: "q12", pillar: "sports",    title: "Run 5K under your target time",       deadline: "Jun 7"  },
  { id: "q13", pillar: "peace",     title: "24hr no-phone challenge",             deadline: "Jun 20" },
  { id: "q14", pillar: "build",     title: "Launch on ProductHunt or Reddit",     deadline: "Jun 28" },
  { id: "q15", pillar: "knowledge", title: "Read 3 books total",                  deadline: "Jun 30" },
];

const today = () => new Date().toISOString().slice(0, 10);

const storage = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const START_DATE = "2026-04-01";
const daysSince = () => {
  const diff = new Date() - new Date(START_DATE);
  return Math.max(0, Math.floor(diff / 86400000));
};

export default function App() {
  const [view, setView]         = useState("today");
  const [tasks, setTasks]       = useState({});
  const [logs, setLogs]         = useState({});
  const [quests, setQuests]     = useState({});
  const [streak, setStreak]     = useState(0);
  const [photo, setPhoto]       = useState(null);
  const [bio, setBio]           = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const savedTasks  = storage.get("sk-tasks");
    const savedLogs   = storage.get("sk-logs")   ?? {};
    const savedQuests = storage.get("sk-quests") ?? {};
    const savedPhoto  = storage.get("sk-photo");
    const savedBio    = storage.get("sk-bio") ?? "";
    if (savedTasks?.date === today()) setTasks(savedTasks.data ?? {});
    setLogs(savedLogs);
    setQuests(savedQuests);
    if (savedPhoto) setPhoto(savedPhoto);
    setBio(savedBio);
  }, []);

  useEffect(() => {
    let s = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (true) {
      const key = d.toISOString().slice(0, 10);
      const entry = logs[key];
      if (!entry || Object.values(entry).every((v) => v === 0)) break;
      s++;
      d.setDate(d.getDate() - 1);
    }
    setStreak(s);
  }, [logs]);

  const toggleTask = (pillar, idx) => {
    const key  = `${pillar}-${idx}`;
    const next = { ...tasks, [key]: !tasks[key] };
    setTasks(next);
    storage.set("sk-tasks", { date: today(), data: next });
    const dayLog = {};
    PILLARS.forEach((p) => {
      dayLog[p.id] = DAILY_TASKS[p.id].filter((_, i) => next[`${p.id}-${i}`]).length;
    });
    const nextLogs = { ...logs, [today()]: dayLog };
    setLogs(nextLogs);
    storage.set("sk-logs", nextLogs);
  };

  const toggleQuest = (id) => {
    const next = { ...quests, [id]: !quests[id] };
    setQuests(next);
    storage.set("sk-quests", next);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target.result);
      storage.set("sk-photo", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const saveBio = (val) => {
    setBio(val);
    storage.set("sk-bio", val);
    setEditingBio(false);
  };

  const totalDone  = Object.values(tasks).filter(Boolean).length;
  const totalTasks = PILLARS.length * 3;
  const questsDone = Object.values(quests).filter(Boolean).length;
  const daysLogged = Object.keys(logs).length;

  const pillarScore = (id) =>
    Math.round((DAILY_TASKS[id].filter((_, i) => tasks[`${id}-${i}`]).length / DAILY_TASKS[id].length) * 100);

  const pillarAllTime = (id) =>
    daysLogged > 0
      ? Math.round((Object.values(logs).reduce((acc, day) => acc + (day[id] ?? 0), 0) /
          (daysLogged * DAILY_TASKS[id].length)) * 100)
      : 0;

  const overallProgress = () =>
    daysLogged === 0 ? 0 :
    Math.round((Object.values(logs).reduce((acc, day) =>
      acc + PILLARS.reduce((s, p) => s + (day[p.id] ?? 0), 0), 0
    ) / (daysLogged * totalTasks)) * 100);

  return (
    <div style={s.root}>
      <div style={s.app}>

        {/* Header */}
        <header style={s.header}>
          <div style={s.headerLeft}>
            <span style={s.logo}>SEEKERS</span>
            <span style={s.logoSub}>Luis's Stack</span>
          </div>
          <div style={s.streakBadge}>🔥 {streak} day{streak !== 1 ? "s" : ""}</div>
        </header>

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { n: streak,     l: "Streak"      },
            { n: daysLogged, l: "Days logged" },
            { n: totalDone,  l: "Tasks today" },
            { n: questsDone, l: "Quests done" },
          ].map((st) => (
            <div key={st.l} style={s.statCard}>
              <div style={s.statN}>{st.n}</div>
              <div style={s.statL}>{st.l}</div>
            </div>
          ))}
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {["today", "profile", "quests", "history"].map((v) => (
            <button key={v}
              style={{ ...s.navBtn, ...(view === v ? s.navActive : {}) }}
              onClick={() => setView(v)}>
              {v}
            </button>
          ))}
        </nav>

        {/* TODAY */}
        {view === "today" && (
          <div style={s.page}>
            <div style={s.progressWrap}>
              <div style={s.progressLabel}>
                <span style={{ color: "#888" }}>Today</span>
                <span>{totalDone}/{totalTasks} tasks</span>
              </div>
              <div style={s.track}><div style={{ ...s.fill, width: `${(totalDone / totalTasks) * 100}%` }} /></div>
            </div>
            {PILLARS.map((pillar) => (
              <div key={pillar.id} style={s.pillarBlock}>
                <div style={s.pillarHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: pillar.color, fontSize: 16 }}>{pillar.emoji}</span>
                    <span style={s.pillarName}>{pillar.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: pillar.color }}>{pillarScore(pillar.id)}%</span>
                </div>
                <div style={s.track}>
                  <div style={{ ...s.fill, width: `${pillarScore(pillar.id)}%`, background: pillar.color }} />
                </div>
                <div style={{ marginTop: 8 }}>
                  {DAILY_TASKS[pillar.id].map((task, i) => {
                    const key  = `${pillar.id}-${i}`;
                    const done = !!tasks[key];
                    return (
                      <div key={key} onClick={() => toggleTask(pillar.id, i)}
                        style={{ ...s.taskRow, opacity: done ? 0.45 : 1 }}>
                        <div style={{ ...s.checkbox, borderColor: done ? pillar.color : "#333", background: done ? pillar.color : "transparent" }}>
                          {done && <span style={s.checkmark}>✓</span>}
                        </div>
                        <span style={{ ...s.taskLabel, textDecoration: done ? "line-through" : "none" }}>{task}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROFILE */}
        {view === "profile" && (
          <div style={s.page}>

            {/* Avatar */}
            <div style={s.profileTop}>
              <div style={s.avatarWrap}
                onClick={() => fileRef.current.click()}
                onMouseEnter={e => e.currentTarget.querySelector(".overlay").style.opacity = 1}
                onMouseLeave={e => e.currentTarget.querySelector(".overlay").style.opacity = 0}>
                {photo
                  ? <img src={photo} alt="Luis" style={s.avatarImg} />
                  : <div style={s.avatarInitials}>L</div>}
                <div className="overlay" style={s.avatarOverlay}>
                  <span style={{ fontSize: 20, color: "#fff" }}>+</span>
                </div>
                <input ref={fileRef} type="file" accept="image/*"
                  style={{ display: "none" }} onChange={handlePhoto} />
              </div>
              <div style={s.profileName}>Luis</div>
              <div style={s.profileSince}>
                Seeker since Apr 1, 2026 · Day {daysSince()}
              </div>
            </div>

            {/* Bio */}
            <div style={s.bioWrap} onClick={() => !editingBio && setEditingBio(true)}>
              {editingBio ? (
                <BioEditor initial={bio} onSave={saveBio} onCancel={() => setEditingBio(false)} />
              ) : (
                <div style={s.bioText}>
                  {bio || <span style={{ color: "#444", fontStyle: "italic" }}>What are you seeking? Tap to add a bio.</span>}
                </div>
              )}
            </div>

            {/* Overall */}
            <div style={s.profileSection}>
              <div style={s.sectionLabel}>Overall progress</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: "#e8e4dc", marginBottom: 8 }}>{overallProgress()}%</div>
              <div style={s.track}><div style={{ ...s.fill, width: `${overallProgress()}%` }} /></div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>
                {daysLogged} day{daysLogged !== 1 ? "s" : ""} logged · {questsDone} quests completed
              </div>
            </div>

            {/* Pillar breakdown */}
            <div style={s.profileSection}>
              <div style={s.sectionLabel}>Luis's Stack</div>
              {PILLARS.map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 110 }}>
                    <span style={{ color: p.color }}>{p.emoji}</span>
                    <span style={{ fontSize: 12, color: "#c8c4bc" }}>{p.label}</span>
                  </div>
                  <div style={{ flex: 1, height: 4, background: "#111820", borderRadius: 2 }}>
                    <div style={{ height: 4, width: `${pillarAllTime(p.id)}%`, background: p.color, borderRadius: 2, transition: "width .4s ease" }} />
                  </div>
                  <span style={{ fontSize: 12, color: "#555", minWidth: 34, textAlign: "right" }}>{pillarAllTime(p.id)}%</span>
                </div>
              ))}
            </div>

            {/* Quest dots */}
            <div style={s.profileSection}>
              <div style={s.sectionLabel}>Side quests</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: "#e8e4dc" }}>{questsDone}</span>
                <span style={{ fontSize: 16, color: "#444" }}>/ {SIDE_QUESTS.length}</span>
                <span style={{ fontSize: 12, color: "#444", marginLeft: 4 }}>completed</span>
              </div>
              <div style={s.track}>
                <div style={{ ...s.fill, width: `${(questsDone / SIDE_QUESTS.length) * 100}%`, background: "#A78BFA" }} />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                {SIDE_QUESTS.map((q) => {
                  const pc = PILLARS.find((p) => p.id === q.pillar)?.color;
                  return (
                    <div key={q.id} style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: quests[q.id] ? pc : "#1a2030",
                      border: `1px solid ${quests[q.id] ? pc : "#2a3040"}`,
                      transition: "all .2s",
                    }} />
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* QUESTS */}
        {view === "quests" && (
          <div style={s.page}>
            <p style={s.sectionNote}>Locked challenges. Check it off when you've truly done it.</p>
            {PILLARS.map((pillar) => {
              const qs = SIDE_QUESTS.filter((q) => q.pillar === pillar.id);
              return (
                <div key={pillar.id} style={s.pillarBlock}>
                  <div style={s.pillarHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: pillar.color, fontSize: 16 }}>{pillar.emoji}</span>
                      <span style={s.pillarName}>{pillar.label}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#555" }}>
                      {qs.filter((q) => quests[q.id]).length}/{qs.length}
                    </span>
                  </div>
                  {qs.map((q) => {
                    const done = !!quests[q.id];
                    return (
                      <div key={q.id} onClick={() => toggleQuest(q.id)}
                        style={{ ...s.taskRow, opacity: done ? 0.4 : 1 }}>
                        <div style={{ ...s.questCircle, borderColor: done ? pillar.color : "#333", background: done ? pillar.color : "transparent" }}>
                          {done && <span style={s.checkmark}>✓</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ ...s.taskLabel, textDecoration: done ? "line-through" : "none" }}>{q.title}</div>
                          <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>Due {q.deadline}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* HISTORY */}
        {view === "history" && (
          <div style={s.page}>
            <p style={s.sectionNote}>Every day you showed up. Every day counts.</p>
            {daysLogged === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", fontSize: 13, color: "#444", fontStyle: "italic" }}>
                No days logged yet. Start today.
              </div>
            ) : (
              Object.entries(logs)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([date, log]) => (
                  <div key={date} style={s.historyRow}>
                    <span style={{ fontSize: 11, color: "#555", minWidth: 50 }}>
                      {new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <div style={{ display: "flex", gap: 4, flex: 1, height: 28, alignItems: "flex-end" }}>
                      {PILLARS.map((p) => {
                        const score = ((log[p.id] ?? 0) / DAILY_TASKS[p.id].length) * 100;
                        return (
                          <div key={p.id} style={{ flex: 1, height: "100%", background: "#111820", borderRadius: 2, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                            <div style={{ width: "100%", height: `${score}%`, background: p.color, borderRadius: 2 }} />
                          </div>
                        );
                      })}
                    </div>
                    <span style={{ fontSize: 11, color: "#555", minWidth: 60, textAlign: "right" }}>
                      {PILLARS.reduce((sum, p) => sum + (log[p.id] ?? 0), 0)}/{totalTasks}
                    </span>
                  </div>
                ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function BioEditor({ initial, onSave, onCancel }) {
  const [val, setVal] = useState(initial);
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <textarea value={val} onChange={(e) => setVal(e.target.value)}
        placeholder="What are you seeking?"
        style={{ width: "100%", background: "#0d1520", border: "1px solid #222", color: "#c8c4bc", fontSize: 13, padding: "10px 12px", borderRadius: 6, resize: "none", minHeight: 70, fontFamily: "inherit", outline: "none" }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => onSave(val)}
          style={{ fontSize: 11, fontWeight: 600, padding: "7px 16px", background: "#F97316", border: "none", color: "#000", cursor: "pointer", borderRadius: 4, fontFamily: "inherit", letterSpacing: 1, textTransform: "uppercase" }}>
          Save
        </button>
        <button onClick={onCancel}
          style={{ fontSize: 11, fontWeight: 600, padding: "7px 14px", background: "transparent", border: "1px solid #333", color: "#888", cursor: "pointer", borderRadius: 4, fontFamily: "inherit", letterSpacing: 1, textTransform: "uppercase" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "#080c10", display: "flex", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" },
  app:  { width: "100%", maxWidth: 480, paddingBottom: 60 },

  header:      { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 20px 16px", borderBottom: "1px solid #111820" },
  headerLeft:  { display: "flex", flexDirection: "column", gap: 2 },
  logo:        { fontSize: 18, fontWeight: 700, color: "#e8e4dc", letterSpacing: 3 },
  logoSub:     { fontSize: 11, color: "#444", letterSpacing: 1 },
  streakBadge: { fontSize: 12, color: "#F97316", background: "#1a0d00", border: "1px solid #2d1800", padding: "4px 10px", borderRadius: 4 },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#111820", borderBottom: "1px solid #111820" },
  statCard: { background: "#080c10", padding: "14px 0", textAlign: "center" },
  statN:    { fontSize: 22, fontWeight: 600, color: "#e8e4dc" },
  statL:    { fontSize: 10, color: "#444", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },

  nav:     { display: "flex", borderBottom: "1px solid #111820" },
  navBtn:  { flex: 1, background: "transparent", border: "none", borderBottom: "2px solid transparent", color: "#444", fontSize: 11, fontWeight: 600, padding: "12px 0", cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "inherit", transition: "all .15s" },
  navActive: { color: "#e8e4dc", borderBottom: "2px solid #F97316" },

  page: { padding: "20px 16px" },

  progressWrap:  { marginBottom: 24 },
  progressLabel: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#e8e4dc", marginBottom: 6 },
  track: { height: 3, background: "#111820", borderRadius: 2 },
  fill:  { height: 3, background: "#F97316", borderRadius: 2, transition: "width .4s ease" },

  pillarBlock:  { marginBottom: 28 },
  pillarHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  pillarName:   { fontSize: 13, fontWeight: 600, color: "#e8e4dc", letterSpacing: 0.5, textTransform: "uppercase" },

  taskRow:  { display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: "#0d1520", border: "1px solid #111820", marginBottom: 4, cursor: "pointer", borderRadius: 6, transition: "opacity .15s" },
  checkbox: { width: 16, height: 16, borderRadius: 3, border: "1px solid #333", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" },
  checkmark:{ fontSize: 10, color: "#fff", fontWeight: 700 },
  taskLabel:{ fontSize: 13, color: "#c8c4bc", lineHeight: 1.4 },

  questCircle: { width: 18, height: 18, borderRadius: "50%", border: "1px solid #333", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" },
  sectionNote: { fontSize: 12, color: "#444", marginBottom: 20, fontStyle: "italic" },

  historyRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#0d1520", border: "1px solid #111820", marginBottom: 4, borderRadius: 6 },

  // Profile
  profileTop:     { display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 24, borderBottom: "1px solid #111820", marginBottom: 24 },
  avatarWrap:     { position: "relative", width: 80, height: 80, borderRadius: "50%", cursor: "pointer", marginBottom: 14, overflow: "hidden" },
  avatarImg:      { width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" },
  avatarInitials: { width: 80, height: 80, borderRadius: "50%", background: "#1a2030", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#F97316" },
  avatarOverlay:  { position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .15s" },
  profileName:    { fontSize: 22, fontWeight: 700, color: "#e8e4dc", letterSpacing: 0.5 },
  profileSince:   { fontSize: 11, color: "#444", marginTop: 4, letterSpacing: 0.5 },

  bioWrap:  { marginBottom: 24, padding: "12px 14px", background: "#0d1520", border: "1px solid #111820", borderRadius: 6, cursor: "text" },
  bioText:  { fontSize: 13, color: "#c8c4bc", lineHeight: 1.6, minHeight: 20 },

  profileSection: { marginBottom: 24 },
  sectionLabel:   { fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12, fontWeight: 600 },
};
