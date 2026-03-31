import { useState, useEffect } from "react";

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

const pillarColor = (id) => PILLARS.find((p) => p.id === id)?.color ?? "#888";

const storage = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

export default function App() {
  const [view, setView]       = useState("today");
  const [tasks, setTasks]     = useState({});
  const [logs, setLogs]       = useState({});
  const [quests, setQuests]   = useState({});
  const [streak, setStreak]   = useState(0);

  useEffect(() => {
    const savedTasks  = storage.get("sk-tasks");
    const savedLogs   = storage.get("sk-logs")   ?? {};
    const savedQuests = storage.get("sk-quests") ?? {};
    if (savedTasks?.date === today()) setTasks(savedTasks.data ?? {});
    setLogs(savedLogs);
    setQuests(savedQuests);
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
    const key = `${pillar}-${idx}`;
    const next = { ...tasks, [key]: !tasks[key] };
    setTasks(next);
    storage.set("sk-tasks", { date: today(), data: next });

    const dayLog = {};
    PILLARS.forEach((p) => {
      const done = DAILY_TASKS[p.id].filter((_, i) => next[`${p.id}-${i}`]).length;
      dayLog[p.id] = done;
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

  const totalDone    = Object.values(tasks).filter(Boolean).length;
  const totalTasks   = PILLARS.length * 3;
  const questsDone   = Object.values(quests).filter(Boolean).length;
  const daysLogged   = Object.keys(logs).length;

  const pillarScore = (id) => {
    const done = DAILY_TASKS[id].filter((_, i) => tasks[`${id}-${i}`]).length;
    return Math.round((done / DAILY_TASKS[id].length) * 100);
  };

  return (
    <div style={styles.root}>
      <div style={styles.app}>

        {/* ── Header ── */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.logo}>SEEKERS</span>
            <span style={styles.logoSub}>Luis's Stack</span>
          </div>
          <div style={styles.streakBadge}>
            🔥 {streak} day{streak !== 1 ? "s" : ""}
          </div>
        </header>

        {/* ── Stats row ── */}
        <div style={styles.statsRow}>
          {[
            { n: streak,      l: "Streak"      },
            { n: daysLogged,  l: "Days logged" },
            { n: totalDone,   l: "Tasks today" },
            { n: questsDone,  l: "Quests done" },
          ].map((s) => (
            <div key={s.l} style={styles.statCard}>
              <div style={styles.statN}>{s.n}</div>
              <div style={styles.statL}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* ── Nav ── */}
        <nav style={styles.nav}>
          {["today", "quests", "history"].map((v) => (
            <button
              key={v}
              style={{ ...styles.navBtn, ...(view === v ? styles.navBtnActive : {}) }}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </nav>

        {/* ── TODAY ── */}
        {view === "today" && (
          <div style={styles.page}>
            <div style={styles.progressWrap}>
              <div style={styles.progressLabel}>
                <span style={{ color: "#888" }}>Today</span>
                <span>{totalDone}/{totalTasks} tasks</span>
              </div>
              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${(totalDone / totalTasks) * 100}%`,
                  }}
                />
              </div>
            </div>

            {PILLARS.map((pillar) => (
              <div key={pillar.id} style={styles.pillarBlock}>
                <div style={styles.pillarHeader}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: pillar.color, fontSize: 16 }}>{pillar.emoji}</span>
                    <span style={styles.pillarName}>{pillar.label}</span>
                  </div>
                  <span style={{ ...styles.pillarScore, color: pillar.color }}>
                    {pillarScore(pillar.id)}%
                  </span>
                </div>
                <div style={{ ...styles.pillarBar }}>
                  <div
                    style={{
                      ...styles.pillarBarFill,
                      width: `${pillarScore(pillar.id)}%`,
                      background: pillar.color,
                    }}
                  />
                </div>
                {DAILY_TASKS[pillar.id].map((task, i) => {
                  const key  = `${pillar.id}-${i}`;
                  const done = !!tasks[key];
                  return (
                    <div
                      key={key}
                      onClick={() => toggleTask(pillar.id, i)}
                      style={{ ...styles.taskRow, opacity: done ? 0.45 : 1 }}
                    >
                      <div style={{ ...styles.checkbox, borderColor: done ? pillar.color : "#333", background: done ? pillar.color : "transparent" }}>
                        {done && <span style={styles.checkmark}>✓</span>}
                      </div>
                      <span style={{ ...styles.taskLabel, textDecoration: done ? "line-through" : "none" }}>
                        {task}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ── QUESTS ── */}
        {view === "quests" && (
          <div style={styles.page}>
            <p style={styles.sectionNote}>
              Locked challenges. One at a time. Check it off when you've truly done it.
            </p>
            {PILLARS.map((pillar) => {
              const qs = SIDE_QUESTS.filter((q) => q.pillar === pillar.id);
              return (
                <div key={pillar.id} style={styles.pillarBlock}>
                  <div style={styles.pillarHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: pillar.color, fontSize: 16 }}>{pillar.emoji}</span>
                      <span style={styles.pillarName}>{pillar.label}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#555" }}>
                      {qs.filter((q) => quests[q.id]).length}/{qs.length}
                    </span>
                  </div>
                  {qs.map((q) => {
                    const done = !!quests[q.id];
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQuest(q.id)}
                        style={{ ...styles.questRow, opacity: done ? 0.4 : 1 }}
                      >
                        <div style={{ ...styles.questCircle, borderColor: done ? pillar.color : "#333", background: done ? pillar.color : "transparent" }}>
                          {done && <span style={styles.checkmark}>✓</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ ...styles.taskLabel, textDecoration: done ? "line-through" : "none" }}>
                            {q.title}
                          </div>
                          <div style={styles.questDeadline}>Due {q.deadline}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ── HISTORY ── */}
        {view === "history" && (
          <div style={styles.page}>
            <p style={styles.sectionNote}>
              Every day you showed up. Every day counts.
            </p>
            {Object.keys(logs).length === 0 ? (
              <div style={styles.empty}>No days logged yet. Start today.</div>
            ) : (
              Object.entries(logs)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([date, log]) => (
                  <div key={date} style={styles.historyRow}>
                    <span style={styles.historyDate}>
                      {new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <div style={styles.historyBars}>
                      {PILLARS.map((p) => {
                        const score = ((log[p.id] ?? 0) / DAILY_TASKS[p.id].length) * 100;
                        return (
                          <div key={p.id} style={styles.historyBarWrap}>
                            <div style={{ ...styles.historyBarFill, height: `${score}%`, background: p.color }} />
                          </div>
                        );
                      })}
                    </div>
                    <span style={styles.historyTotal}>
                      {PILLARS.reduce((s, p) => s + (log[p.id] ?? 0), 0)}/{totalTasks} tasks
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

const styles = {
  root: {
    minHeight: "100vh",
    background: "#080c10",
    display: "flex",
    justifyContent: "center",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  app: {
    width: "100%",
    maxWidth: 480,
    paddingBottom: 60,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 20px 16px",
    borderBottom: "1px solid #111820",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    color: "#e8e4dc",
    letterSpacing: 3,
  },
  logoSub: {
    fontSize: 11,
    color: "#444",
    letterSpacing: 1,
  },
  streakBadge: {
    fontSize: 12,
    color: "#F97316",
    background: "#1a0d00",
    border: "1px solid #2d1800",
    padding: "4px 10px",
    borderRadius: 4,
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 1,
    background: "#111820",
    borderBottom: "1px solid #111820",
  },
  statCard: {
    background: "#080c10",
    padding: "14px 0",
    textAlign: "center",
  },
  statN: {
    fontSize: 22,
    fontWeight: 600,
    color: "#e8e4dc",
  },
  statL: {
    fontSize: 10,
    color: "#444",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nav: {
    display: "flex",
    borderBottom: "1px solid #111820",
  },
  navBtn: {
    flex: 1,
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#444",
    fontSize: 12,
    fontWeight: 600,
    padding: "12px 0",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontFamily: "inherit",
    transition: "all .15s",
  },
  navBtnActive: {
    color: "#e8e4dc",
    borderBottom: "2px solid #F97316",
  },
  page: {
    padding: "20px 16px",
  },
  progressWrap: {
    marginBottom: 24,
  },
  progressLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#e8e4dc",
    marginBottom: 6,
  },
  progressTrack: {
    height: 3,
    background: "#111820",
    borderRadius: 2,
  },
  progressFill: {
    height: 3,
    background: "#F97316",
    borderRadius: 2,
    transition: "width .4s ease",
  },
  pillarBlock: {
    marginBottom: 28,
  },
  pillarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pillarName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e8e4dc",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  pillarScore: {
    fontSize: 12,
    fontWeight: 600,
  },
  pillarBar: {
    height: 2,
    background: "#111820",
    marginBottom: 10,
    borderRadius: 1,
  },
  pillarBarFill: {
    height: 2,
    borderRadius: 1,
    transition: "width .4s ease",
  },
  taskRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 12px",
    background: "#0d1520",
    border: "1px solid #111820",
    marginBottom: 4,
    cursor: "pointer",
    borderRadius: 6,
    transition: "opacity .15s",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    border: "1px solid #333",
    flexShrink: 0,
    marginTop: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all .15s",
  },
  checkmark: {
    fontSize: 10,
    color: "#fff",
    fontWeight: 700,
  },
  taskLabel: {
    fontSize: 13,
    color: "#c8c4bc",
    lineHeight: 1.4,
  },
  sectionNote: {
    fontSize: 12,
    color: "#444",
    marginBottom: 20,
    fontStyle: "italic",
  },
  questRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 12px",
    background: "#0d1520",
    border: "1px solid #111820",
    marginBottom: 4,
    cursor: "pointer",
    borderRadius: 6,
  },
  questCircle: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "1px solid #333",
    flexShrink: 0,
    marginTop: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all .15s",
  },
  questDeadline: {
    fontSize: 11,
    color: "#555",
    marginTop: 3,
  },
  historyRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    background: "#0d1520",
    border: "1px solid #111820",
    marginBottom: 4,
    borderRadius: 6,
  },
  historyDate: {
    fontSize: 11,
    color: "#555",
    minWidth: 50,
  },
  historyBars: {
    display: "flex",
    gap: 4,
    flex: 1,
    height: 28,
    alignItems: "flex-end",
  },
  historyBarWrap: {
    flex: 1,
    height: "100%",
    background: "#111820",
    borderRadius: 2,
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
  },
  historyBarFill: {
    width: "100%",
    borderRadius: 2,
    transition: "height .3s ease",
  },
  historyTotal: {
    fontSize: 11,
    color: "#555",
    minWidth: 60,
    textAlign: "right",
  },
  empty: {
    textAlign: "center",
    padding: "40px 20px",
    fontSize: 13,
    color: "#444",
    fontStyle: "italic",
  },
};
