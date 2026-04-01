import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const injectFont = () => {
  if (document.getElementById("sk-font")) return;
  const l = document.createElement("link");
  l.id = "sk-font"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
};

const PILLARS = [
  { id: "knowledge", label: "Knowledge", color: "#5B9CF6" },
  { id: "peace",     label: "Peace",     color: "#C084FC" },
  { id: "build",     label: "Build",     color: "#FB923C" },
  { id: "sports",    label: "Sports",    color: "#34D399" },
];

const DAILY_TASKS = {
  knowledge: ["Read 15+ pages of a non-fiction book", "Study one concept deeply for 20 min", "Write one insight you learned today"],
  peace:     ["10-minute meditation — no phone before this", "Write 3 intentions for the day", "5-minute evening reflection"],
  build:     ["30-minute focused build sprint", "Ship or improve one feature", "Review what you built — honest assessment"],
  sports:    ["Train hard — track one metric to beat", "Cold exposure or mobility work", "Log your performance honestly"],
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

/* ── Founder config ── */
const FOUNDER_USERNAME = "luisdustdar";
const FOUNDER_COLOR    = "#F5C842";

const todayKey  = () => new Date().toISOString().slice(0, 10);
const START     = "2026-04-01";
const daysSince = () => Math.max(0, Math.floor((new Date() - new Date(START)) / 86400000));
const store     = {
  get: (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ── Icons ── */
const IconHome = ({ a }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={a?"#fff":"#555"} strokeWidth={a?"1.8":"1.5"} fill={a?"rgba(255,255,255,0.08)":"none"} strokeLinejoin="round"/>
    <path d="M9 21V12h6v9" stroke={a?"#fff":"#555"} strokeWidth={a?"1.8":"1.5"} strokeLinejoin="round"/>
  </svg>
);
const IconFeed = ({ a }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={a?"#fff":"#555"} strokeWidth={a?"1.8":"1.5"}/>
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={a?"#fff":"#555"} strokeWidth={a?"1.8":"1.5"}/>
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={a?"#fff":"#555"} strokeWidth={a?"1.8":"1.5"}/>
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={a?"#fff":"#555"} strokeWidth={a?"1.8":"1.5"}/>
  </svg>
);
const IconQuests = ({ a }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9 11l3 3L22 4" stroke={a?"#fff":"#555"} strokeWidth={a?"1.8":"1.5"} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke={a?"#fff":"#555"} strokeWidth={a?"1.8":"1.5"} strokeLinecap="round"/>
  </svg>
);
const IconCoach = ({ a }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2a9 9 0 019 9c0 3.5-2 6.5-5 8l-4 3-4-3c-3-1.5-5-4.5-5-8a9 9 0 019-9z" stroke={a?"#fff":"#555"} strokeWidth={a?"1.8":"1.5"} strokeLinejoin="round"/>
    <circle cx="12" cy="11" r="2" fill={a?"#fff":"#555"}/>
  </svg>
);
const IconProfile = ({ a, photo }) => photo ? (
  <img src={photo} alt="" style={{ width:26, height:26, borderRadius:"50%", objectFit:"cover", border: a?"2px solid #fff":"2px solid #333" }}/>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={a?"#fff":"#555"} strokeWidth={a?"1.8":"1.5"}/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={a?"#fff":"#555"} strokeWidth={a?"1.8":"1.5"} strokeLinecap="round"/>
  </svg>
);
const IconIncognito = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke={active?"#C084FC":"#555"} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke={active?"#C084FC":"#555"} strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M1 1l22 22" stroke={active?"#C084FC":"#555"} strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

/* ── Founder badge ── */
function FounderBadge() {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"#2a1f00", border:"1px solid #F5C84244", borderRadius:6, padding:"2px 7px", fontSize:10, color:FOUNDER_COLOR, fontWeight:600, letterSpacing:0.5, marginLeft:6 }}>
      ✦ Founder
    </span>
  );
}

/* ── Ring chart ── */
function RingChart({ pct }) {
  const r=28, circ=2*Math.PI*r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{flexShrink:0}}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1a1a1a" strokeWidth="6"/>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#fff" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ-(pct/100)*circ}
        strokeLinecap="round" transform="rotate(-90 36 36)"
        style={{transition:"stroke-dashoffset .6s ease"}}/>
      <text x="36" y="40" textAnchor="middle" style={{fontSize:13,fontWeight:700,fill:"#fff",fontFamily:"DM Sans, system-ui"}}>{pct}%</text>
    </svg>
  );
}

/* ── Inline editor ── */
function InlineEdit({ value, placeholder, onSave, style, multiline=false, F }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);
  if (editing) {
    const sh = { value:val, onChange:e=>setVal(e.target.value), placeholder, style:{ width:"100%", background:"#111", border:"1px solid #2a2a2a", color:"#e0ddd8", fontSize:14, padding:"10px 12px", borderRadius:10, fontFamily:F, outline:"none", lineHeight:1.6, boxSizing:"border-box", ...style } };
    return (
      <div onClick={e=>e.stopPropagation()}>
        {multiline ? <textarea {...sh} rows={3} style={{...sh.style,resize:"none"}}/> : <input {...sh} type="text"/>}
        <div style={{display:"flex",gap:6,marginTop:6}}>
          <button onClick={()=>{onSave(val);setEditing(false);}} style={{fontSize:12,fontWeight:600,padding:"7px 16px",background:"#fff",border:"none",color:"#000",cursor:"pointer",borderRadius:8,fontFamily:F}}>Save</button>
          <button onClick={()=>{setVal(value);setEditing(false);}} style={{fontSize:12,padding:"7px 14px",background:"transparent",border:"1px solid #222",color:"#666",cursor:"pointer",borderRadius:8,fontFamily:F}}>Cancel</button>
        </div>
      </div>
    );
  }
  return (
    <div onClick={()=>setEditing(true)} style={{cursor:"text"}}>
      {value ? <span style={style}>{value}</span> : <span style={{...style,color:"#444",fontStyle:"italic"}}>{placeholder}</span>}
    </div>
  );
}

/* ── Pinned note ── */
function PinnedNote({ note, pillarColor, onEdit, onClear, F }) {
  if (!note) return (
    <div onClick={onEdit} style={{border:"1px dashed #222",borderRadius:16,padding:"16px 18px",cursor:"pointer",marginBottom:20}}>
      <div style={{fontSize:13,color:"#444",fontStyle:"italic"}}>+ Pin a quote or idea to your profile</div>
    </div>
  );
  return (
    <div style={{borderLeft:`3px solid ${pillarColor||"#5B9CF6"}`,background:"#0a0a0a",borderRadius:"0 16px 16px 0",padding:"16px 18px",marginBottom:20}}>
      <div style={{fontSize:15,color:"#e0ddd8",lineHeight:1.65,fontStyle:"italic",fontWeight:300}}>"{note}"</div>
      <div style={{display:"flex",gap:10,marginTop:12}}>
        <button onClick={onEdit} style={{fontSize:11,color:"#555",background:"transparent",border:"none",cursor:"pointer",padding:0,fontFamily:F}}>Edit</button>
        <button onClick={onClear} style={{fontSize:11,color:"#555",background:"transparent",border:"none",cursor:"pointer",padding:0,fontFamily:F}}>Remove</button>
      </div>
    </div>
  );
}

/* ── Pin modal ── */
function PinNoteModal({ initial, onSave, onClose, F }) {
  const [val, setVal] = useState(initial ?? "");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{width:"100%",maxWidth:430,background:"#111",borderRadius:"20px 20px 0 0",padding:"24px 20px 40px",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:4,background:"#333",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontSize:16,fontWeight:600,color:"#fff",marginBottom:6}}>Pin a note to your profile</div>
        <div style={{fontSize:13,color:"#555",marginBottom:16}}>A quote, an idea, something that defines this season.</div>
        <textarea value={val} onChange={e=>setVal(e.target.value)} placeholder="e.g. The obstacle is the way." rows={4}
          style={{width:"100%",background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#e0ddd8",fontSize:15,padding:"12px 14px",borderRadius:12,fontFamily:F,outline:"none",lineHeight:1.7,resize:"none",boxSizing:"border-box",fontStyle:"italic"}}/>
        <button onClick={()=>{onSave(val);onClose();}} style={{width:"100%",marginTop:12,fontSize:14,fontWeight:600,padding:"14px 0",background:"#fff",border:"none",color:"#000",cursor:"pointer",borderRadius:12,fontFamily:F}}>Pin it</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════
   AUTH SCREEN
══════════════════════════════ */
function AuthScreen({ F, MONO }) {
  const [mode, setMode]           = useState("login");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [username, setUsername]   = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const inputStyle = {
    width:"100%", background:"#0d0d0d", border:"1px solid #222",
    color:"#e0ddd8", fontSize:15, padding:"14px 16px", borderRadius:14,
    fontFamily:F, outline:"none", boxSizing:"border-box",
  };

  const handleSubmit = async () => {
    setError(""); setSuccess(""); setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      /* ── Validation ── */
      if (!username.trim())              { setError("Username is required.");                                          setLoading(false); return; }
      if (username.length < 3)           { setError("Username must be at least 3 characters.");                       setLoading(false); return; }
      if (!/^[a-z0-9_]+$/.test(username)){ setError("Username: lowercase letters, numbers and underscores only.");   setLoading(false); return; }
      if (!email.trim())                 { setError("Email is required.");                                            setLoading(false); return; }
      if (password.length < 8)           { setError("Password must be at least 8 characters.");                      setLoading(false); return; }

      /* ── Check username availability before signing up ── */
      const { data: existing } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .maybeSingle();
      if (existing) { setError("Username already taken. Try another."); setLoading(false); return; }

      /* ── Sign up — trigger handles profile creation ── */
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username:     username.toLowerCase(),
            display_name: displayName.trim() || username,
          },
        },
      });

      if (signUpError) { setError(signUpError.message); setLoading(false); return; }

      setSuccess("Account created! Check your email to confirm, then sign in.");
      setMode("login");
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"#000",display:"flex",justifyContent:"center",alignItems:"center",fontFamily:F,padding:"0 20px"}}>
      <div style={{width:"100%",maxWidth:360}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:32,fontWeight:700,color:"#fff",letterSpacing:-1,marginBottom:6}}>SEEKERS</div>
          <div style={{fontSize:14,color:"#444",letterSpacing:0.5}}>Become who you're meant to be.</div>
        </div>

        {/* Toggle */}
        <div style={{display:"flex",background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:14,padding:4,marginBottom:24}}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setError("");setSuccess("");}}
              style={{flex:1,padding:"10px 0",background:mode===m?"#fff":"transparent",border:"none",borderRadius:10,fontSize:13,fontWeight:600,color:mode===m?"#000":"#555",cursor:"pointer",fontFamily:F,transition:"all .2s"}}>
              {m==="login"?"Sign in":"Create account"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {mode==="signup"&&(
            <>
              <input
                value={username}
                onChange={e=>setUsername(e.target.value.toLowerCase())}
                placeholder="Username"
                style={inputStyle}
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
              />
              <input
                value={displayName}
                onChange={e=>setDisplayName(e.target.value)}
                placeholder="Display name"
                style={inputStyle}
                type="text"
              />
            </>
          )}
          <input
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="Email"
            style={inputStyle}
            type="email"
            autoCapitalize="none"
          />
          <input
            value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="Password"
            style={inputStyle}
            type="password"
            onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
          />
        </div>

        {error&&(
          <div style={{background:"#1a0808",border:"1px solid #3a1010",borderRadius:10,padding:"12px 14px",marginBottom:14,fontSize:13,color:"#ff8080",lineHeight:1.5}}>{error}</div>
        )}
        {success&&(
          <div style={{background:"#081a0a",border:"1px solid #103a14",borderRadius:10,padding:"12px 14px",marginBottom:14,fontSize:13,color:"#80ff90",lineHeight:1.5}}>{success}</div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{width:"100%",padding:"15px 0",background:loading?"#111":"#fff",border:"none",borderRadius:14,fontSize:15,fontWeight:600,color:loading?"#444":"#000",cursor:loading?"not-allowed":"pointer",fontFamily:F,transition:"all .2s"}}>
          {loading?"...":mode==="login"?"Sign in":"Create account"}
        </button>

        {mode==="signup"&&(
          <div style={{fontSize:12,color:"#333",textAlign:"center",marginTop:14,lineHeight:1.6}}>
            Username is permanent and public.
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   COACH PAGE
══════════════════════════════ */
function CoachPage({ logs, tasks, quests, streak, totalTasks, F, MONO }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cached, setCached]   = useState(null);
  const [error, setError]     = useState("");

  useEffect(()=>{
    const saved = store.get("sk-coach");
    if (saved?.date===todayKey()) setCached(saved.msg);
  },[]);

  const buildPrompt = () => {
    const last7 = Object.entries(logs).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7)
      .map(([date,log])=>`${date} → ${PILLARS.map(p=>`${p.label[0]}:${log[p.id]??0}/${DAILY_TASKS[p.id].length}`).join(" ")}`)
      .join("\n")||"No data yet — this is day 1.";
    const todayDone = PILLARS.map(p=>`${p.label}: ${DAILY_TASKS[p.id].filter((_,i)=>tasks[`${p.id}-${i}`]).length}/${DAILY_TASKS[p.id].length}`).join(", ");
    const questsDone = SIDE_QUESTS.filter(q=>quests[q.id]).map(q=>q.title).join(", ")||"none yet";
    return `You are the AI coach inside Seekers — a personal growth app. The user is on a 3-month transformation across 4 pillars: Knowledge, Peace, Build, and Sports.\n\nLast 7 days:\n${last7}\n\nToday so far: ${todayDone}\nStreak: ${streak} days\nQuests completed: ${questsDone}\n\nGive a raw, honest, direct analysis. No fluff. No fake positivity.\n\nFormat:\n1. One sentence on what the data actually shows.\n2. One sentence calling out the pillar being avoided — be specific.\n3. One sentence on what's working.\n4. One bold specific action for TODAY — doable in the next 2 hours.\n\nMax 5 sentences. No greetings. No sign-offs.`;
  };

  const getCoaching = async () => {
    setLoading(true); setMessage(""); setError("");
    const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
    if (!apiKey) { setError("API key not found. Add VITE_ANTHROPIC_KEY to Vercel."); setLoading(false); return; }
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,stream:true,messages:[{role:"user",content:buildPrompt()}]}),
      });
      if(!res.ok){const e=await res.json();throw new Error(e.error?.message||"API error");}
      const reader=res.body.getReader(),decoder=new TextDecoder();
      let full="";
      while(true){
        const {done,value}=await reader.read(); if(done)break;
        const lines=decoder.decode(value).split("\n").filter(l=>l.startsWith("data: "));
        for(const line of lines){
          const data=line.slice(6); if(data==="[DONE]")continue;
          try{const p=JSON.parse(data);if(p.type==="content_block_delta"&&p.delta?.text){full+=p.delta.text;setMessage(full);}}catch{}
        }
      }
      store.set("sk-coach",{date:todayKey(),msg:full}); setCached(full);
    }catch(e){setError(e.message||"Something went wrong.");}
    setLoading(false);
  };

  const display   = message||cached;
  const sentences = display?display.split(/(?<=[.!?])\s+/).filter(s=>s.trim().length>0):[];
  const colors    = ["#5B9CF6","#C084FC","#34D399","#FB923C"];

  return (
    <div style={{padding:"0 16px"}}>
      <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:20,padding:"20px",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"#111",border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center"}}><IconCoach a={true}/></div>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:"#fff"}}>Your Coach</div>
            <div style={{fontSize:12,color:"#555"}}>Brutal. Direct. Honest.</div>
          </div>
          {cached&&!loading&&<div style={{marginLeft:"auto",fontSize:10,color:"#333",fontFamily:MONO}}>Today</div>}
        </div>
        {display?(
          <div style={{marginBottom:16}}>
            {sentences.map((sentence,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:i<sentences.length-1?14:0,alignItems:"flex-start"}}>
                <div style={{width:3,borderRadius:2,background:colors[i%colors.length],flexShrink:0,marginTop:4,alignSelf:"stretch",minHeight:16}}/>
                <p style={{fontSize:15,color:i===sentences.length-1?"#fff":"#c8c5be",lineHeight:1.65,margin:0,fontWeight:i===sentences.length-1?500:400}}>{sentence}</p>
              </div>
            ))}
          </div>
        ):!loading&&(
          <div style={{fontSize:14,color:"#444",fontStyle:"italic",marginBottom:16,lineHeight:1.6}}>Your coach reads your last 7 days and tells you exactly what's happening.</div>
        )}
        {loading&&(
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#333"}}/>)}</div>
              <span style={{fontSize:12,color:"#444"}}>Reading your data…</span>
            </div>
            {message&&<p style={{fontSize:15,color:"#c8c5be",lineHeight:1.65,margin:0}}>{message}</p>}
          </div>
        )}
        {error&&<div style={{background:"#1a0a0a",border:"1px solid #3a1a1a",borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:13,color:"#ff6b6b",lineHeight:1.5}}>{error}</div>}
        <button onClick={getCoaching} disabled={loading}
          style={{width:"100%",padding:"13px 0",background:loading?"#111":"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:600,color:loading?"#444":"#000",cursor:loading?"not-allowed":"pointer",fontFamily:F,transition:"all .2s"}}>
          {loading?"Reading your data…":cached?"Get today's coaching again":"Get today's coaching"}
        </button>
      </div>
      <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:20,padding:"18px 16px",marginBottom:20}}>
        <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>What the coach sees</div>
        {Object.keys(logs).length===0
          ?<div style={{fontSize:13,color:"#444",fontStyle:"italic"}}>No days logged yet. Check off tasks on the Home tab first.</div>
          :Object.entries(logs).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7).map(([date,log])=>{
            const total=PILLARS.reduce((s,p)=>s+(log[p.id]??0),0);
            const pct=Math.round((total/(PILLARS.length*3))*100);
            return(
              <div key={date} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:11,color:"#555",fontFamily:MONO,minWidth:52}}>{new Date(date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
                <div style={{flex:1,display:"flex",gap:3,height:20,alignItems:"flex-end"}}>
                  {PILLARS.map(p=>{
                    const score=((log[p.id]??0)/DAILY_TASKS[p.id].length)*100;
                    return<div key={p.id} style={{flex:1,height:"100%",background:"#1a1a1a",borderRadius:3,overflow:"hidden",display:"flex",alignItems:"flex-end"}}><div style={{width:"100%",height:`${score}%`,background:p.color,borderRadius:3}}/></div>;
                  })}
                </div>
                <span style={{fontSize:11,color:pct===100?"#34D399":pct>=50?"#888":"#444",fontFamily:MONO,minWidth:34,textAlign:"right"}}>{pct}%</span>
              </div>
            );
          })
        }
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",paddingBottom:8}}>
        {PILLARS.map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:p.color}}/>
            <span style={{fontSize:11,color:"#555"}}>{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════
   ROOT APP
══════════════════════════════ */
export default function App() {
  injectFont();
  const F    = "DM Sans, system-ui, sans-serif";
  const MONO = "DM Mono, monospace";

  const [session, setSession]         = useState(null);
  const [profile, setProfile]         = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [view, setView]               = useState("home");
  const [tasks, setTasks]             = useState({});
  const [logs, setLogs]               = useState({});
  const [quests, setQuests]           = useState({});
  const [streak, setStreak]           = useState(0);
  const [photo, setPhoto]             = useState(null);
  const [bio, setBio]                 = useState("");
  const [tagline, setTagline]         = useState("");
  const [obsession, setObsession]     = useState("");
  const [pinnedNote, setPinnedNote]   = useState("");
  const [pinnedColor]                 = useState("#5B9CF6");
  const [incognito, setIncognito]     = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const fileRef = useRef();

  /* ── Auth ── */
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setSession(session);
      if(session) loadProfile(session.user.id);
      else setAuthLoading(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>{
      setSession(session);
      if(session) loadProfile(session.user.id);
      else{setAuthLoading(false);setProfile(null);}
    });
    return()=>subscription.unsubscribe();
  },[]);

  const loadProfile = async (userId) => {
    const {data} = await supabase.from("profiles").select("*").eq("id",userId).single();
    if(data){
      setProfile(data);
      setBio(data.bio||"");
      setTagline(data.tagline||"");
      setObsession(data.obsession||"");
      setPinnedNote(data.pinned_note||"");
    }
    await loadLogs(userId);
    await loadQuests(userId);
    const savedTasks=store.get("sk-tasks");
    if(savedTasks?.date===todayKey()) setTasks(savedTasks.data??{});
    setIncognito(store.get("sk-incognito")??false);
    const p=store.get("sk-photo"); if(p) setPhoto(p);
    setAuthLoading(false);
  };

  const loadLogs = async (userId) => {
    const {data} = await supabase.from("logs").select("*").eq("user_id",userId);
    if(data){
      const mapped={};
      data.forEach(row=>{mapped[row.date]={knowledge:row.knowledge,peace:row.peace,build:row.build,sports:row.sports};});
      setLogs(mapped);
    }
  };

  const loadQuests = async (userId) => {
    const {data} = await supabase.from("quests").select("*").eq("user_id",userId);
    if(data){
      const mapped={};
      data.forEach(row=>{mapped[row.quest_id]=row.completed;});
      setQuests(mapped);
    }
  };

  /* ── Streak ── */
  useEffect(()=>{
    let s=0;
    const d=new Date(); d.setDate(d.getDate()-1);
    while(true){
      const k=d.toISOString().slice(0,10);
      const e=logs[k];
      if(!e||Object.values(e).every(v=>v===0))break;
      s++; d.setDate(d.getDate()-1);
    }
    setStreak(s);
  },[logs]);

  /* ── Actions ── */
  const toggleTask = async (pillar,idx) => {
    const key=`${pillar}-${idx}`;
    const next={...tasks,[key]:!tasks[key]};
    setTasks(next);
    store.set("sk-tasks",{date:todayKey(),data:next});
    const dayLog={};
    PILLARS.forEach(p=>{dayLog[p.id]=DAILY_TASKS[p.id].filter((_,i)=>next[`${p.id}-${i}`]).length;});
    const nl={...logs,[todayKey()]:dayLog};
    setLogs(nl);
    if(session) await supabase.from("logs").upsert({user_id:session.user.id,date:todayKey(),...dayLog},{onConflict:"user_id,date"});
  };

  const toggleQuest = async (id) => {
    const next={...quests,[id]:!quests[id]};
    setQuests(next);
    if(session) await supabase.from("quests").upsert({user_id:session.user.id,quest_id:id,completed:next[id]},{onConflict:"user_id,quest_id"});
  };

  const updateProfile = async (field,value) => {
    if(!session)return;
    await supabase.from("profiles").update({[field]:value}).eq("id",session.user.id);
    setProfile(prev=>({...prev,[field]:value}));
  };

  const saveBio       = v=>{setBio(v);       updateProfile("bio",v);};
  const saveTagline   = v=>{setTagline(v);   updateProfile("tagline",v);};
  const saveObsession = v=>{setObsession(v); updateProfile("obsession",v);};
  const savePinned    = v=>{setPinnedNote(v);updateProfile("pinned_note",v);};
  const clearPinned   = ()=>{setPinnedNote("");updateProfile("pinned_note","");};
  const toggleIncognito = ()=>{const n=!incognito;setIncognito(n);store.set("sk-incognito",n);};

  const handlePhoto = e=>{
    const file=e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{setPhoto(ev.target.result);store.set("sk-photo",ev.target.result);};
    reader.readAsDataURL(file);
  };

  const signOut = async()=>{
    await supabase.auth.signOut();
    setTasks({});setLogs({});setQuests({});setStreak(0);
    setPhoto(null);setBio("");setTagline("");setObsession("");setPinnedNote("");
  };

  /* ── Computed ── */
  const totalDone  = Object.values(tasks).filter(Boolean).length;
  const totalTasks = PILLARS.length*3;
  const questsDone = Object.values(quests).filter(Boolean).length;
  const daysLogged = Object.keys(logs).length;
  const todayPct   = Math.round((totalDone/totalTasks)*100);

  const pillarToday   = id=>Math.round((DAILY_TASKS[id].filter((_,i)=>tasks[`${id}-${i}`]).length/DAILY_TASKS[id].length)*100);
  const pillarAllTime = id=>daysLogged===0?0:Math.round((Object.values(logs).reduce((a,d)=>a+(d[id]??0),0)/(daysLogged*DAILY_TASKS[id].length))*100);
  const overall       = ()=>daysLogged===0?0:Math.round((Object.values(logs).reduce((a,d)=>a+PILLARS.reduce((s,p)=>s+(d[p.id]??0),0),0)/(daysLogged*totalTasks))*100);

  /* ── Founder check ── */
  const isFounder    = profile?.username === FOUNDER_USERNAME;
  const displayName  = profile?.display_name || profile?.username || "Seeker";
  const nameColor    = isFounder ? FOUNDER_COLOR : "#fff";
  const stackLabel   = `${displayName}'s Stack`;

  const TABS = [
    {id:"home",    label:"Home",    Icon:({a})=><IconHome a={a}/>},
    {id:"feed",    label:"Feed",    Icon:({a})=><IconFeed a={a}/>},
    {id:"coach",   label:"Coach",   Icon:({a})=><IconCoach a={a}/>},
    {id:"quests",  label:"Quests",  Icon:({a})=><IconQuests a={a}/>},
    {id:"profile", label:"Profile", Icon:({a})=><IconProfile a={a} photo={photo}/>},
  ];

  /* ── Loading ── */
  if(authLoading) return(
    <div style={{minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:24,fontWeight:700,color:"#fff",letterSpacing:-0.5,marginBottom:8}}>SEEKERS</div>
        <div style={{fontSize:12,color:"#444"}}>Loading…</div>
      </div>
    </div>
  );

  if(!session) return <AuthScreen F={F} MONO={MONO}/>;

  return(
    <div style={{fontFamily:F,background:"#000",minHeight:"100vh",display:"flex",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:430,position:"relative",minHeight:"100vh",background:"#000"}}>
        <div style={{height:48}}/>

        {/* TOP BAR */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px 16px"}}>
          <div>
            <div style={{fontSize:22,fontWeight:700,color:"#fff",letterSpacing:-0.5}}>Seekers</div>
            <div style={{fontSize:12,color:"#555",letterSpacing:0.3,marginTop:1}}>{stackLabel}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={toggleIncognito}
              style={{display:"flex",alignItems:"center",gap:5,background:incognito?"#1a0d2e":"#111",border:`1px solid ${incognito?"#C084FC44":"#1e1e1e"}`,borderRadius:20,padding:"6px 10px",cursor:"pointer"}}>
              <IconIncognito active={incognito}/>
              {incognito&&<span style={{fontSize:10,color:"#C084FC",fontFamily:MONO}}>private</span>}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"#111",border:"1px solid #1e1e1e",borderRadius:20,padding:"6px 12px"}}>
              <span style={{fontSize:14}}>🔥</span>
              {incognito
                ?<span style={{fontSize:13,color:"#555"}}>—</span>
                :<><span style={{fontSize:13,fontWeight:600,color:"#fff"}}>{streak}</span><span style={{fontSize:11,color:"#555"}}>day{streak!==1?"s":""}</span></>
              }
            </div>
          </div>
        </div>

        {/* STAT STRIP */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,padding:"0 16px 20px"}}>
          {[{n:streak,l:"Streak"},{n:daysLogged,l:"Days"},{n:totalDone,l:"Today"},{n:questsDone,l:"Quests"}].map(st=>(
            <div key={st.l} style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:700,color:"#fff",filter:incognito&&(st.l==="Streak"||st.l==="Days")?"blur(6px)":"none",transition:"all .3s",userSelect:incognito?"none":"auto"}}>{st.n}</div>
              <div style={{fontSize:10,color:"#444",marginTop:2,letterSpacing:0.5,textTransform:"uppercase"}}>{st.l}</div>
            </div>
          ))}
        </div>

        {/* PAGES */}
        <div style={{paddingBottom:90}}>

          {/* HOME */}
          {view==="home"&&(
            <div style={{padding:"0 16px"}}>
              <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:20,padding:"20px",marginBottom:20,display:"flex",alignItems:"center",gap:20}}>
                <RingChart pct={todayPct}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:"#555",marginBottom:4}}>Today's progress</div>
                  <div style={{fontSize:28,fontWeight:700,color:"#fff",lineHeight:1}}>{todayPct}%</div>
                  <div style={{fontSize:12,color:"#444",marginTop:4}}>{totalDone} of {totalTasks} tasks done</div>
                  <div style={{display:"flex",gap:6,marginTop:12}}>
                    {PILLARS.map(p=>(
                      <div key={p.id} style={{flex:1,height:3,borderRadius:2,background:"#1a1a1a",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${pillarToday(p.id)}%`,background:p.color,borderRadius:2,transition:"width .4s ease"}}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {PILLARS.map(pillar=>(
                <div key={pillar.id} style={{marginBottom:24}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:pillar.color}}/>
                      <span style={{fontSize:13,fontWeight:600,color:"#e0ddd8",letterSpacing:0.3,textTransform:"uppercase"}}>{pillar.label}</span>
                    </div>
                    <span style={{fontSize:12,fontWeight:600,color:pillar.color,fontFamily:MONO}}>{pillarToday(pillar.id)}%</span>
                  </div>
                  {DAILY_TASKS[pillar.id].map((task,i)=>{
                    const key=`${pillar.id}-${i}`,done=!!tasks[key];
                    return(
                      <div key={key} onClick={()=>toggleTask(pillar.id,i)}
                        style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 14px",background:"#0d0d0d",border:"1px solid #1e1e1e",borderRadius:14,marginBottom:6,cursor:"pointer",opacity:done?0.45:1,transition:"opacity .15s"}}>
                        <div style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${done?pillar.color:"#333"}`,background:done?pillar.color:"transparent",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                          {done&&<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                        </div>
                        <span style={{fontSize:14,color:done?"#444":"#c8c5be",lineHeight:1.45,textDecoration:done?"line-through":"none",flex:1}}>{task}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* FEED */}
          {view==="feed"&&(
            <div style={{padding:"0 16px",textAlign:"center",paddingTop:60}}>
              <div style={{fontSize:36,marginBottom:16}}>✦</div>
              <div style={{fontSize:18,fontWeight:600,color:"#fff",marginBottom:8}}>Knowledge Feed</div>
              <div style={{fontSize:14,color:"#555",lineHeight:1.6}}>AI-generated philosophy, health, sport science and ideas. Coming in v2.</div>
            </div>
          )}

          {/* COACH */}
          {view==="coach"&&<CoachPage logs={logs} tasks={tasks} quests={quests} streak={streak} totalTasks={totalTasks} F={F} MONO={MONO}/>}

          {/* QUESTS */}
          {view==="quests"&&(
            <div style={{padding:"0 16px"}}>
              <div style={{fontSize:13,color:"#444",fontStyle:"italic",marginBottom:20}}>Locked challenges. Check it off only when you've truly done it.</div>
              {PILLARS.map(pillar=>{
                const qs=SIDE_QUESTS.filter(q=>q.pillar===pillar.id);
                const done=qs.filter(q=>quests[q.id]).length;
                return(
                  <div key={pillar.id} style={{marginBottom:28}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:pillar.color}}/>
                        <span style={{fontSize:13,fontWeight:600,color:"#e0ddd8",textTransform:"uppercase",letterSpacing:0.3}}>{pillar.label}</span>
                      </div>
                      <span style={{fontSize:11,color:"#444",fontFamily:MONO}}>{done}/{qs.length}</span>
                    </div>
                    {qs.map(q=>{
                      const d=!!quests[q.id];
                      return(
                        <div key={q.id} onClick={()=>toggleQuest(q.id)}
                          style={{display:"flex",alignItems:"flex-start",gap:12,padding:"13px 14px",background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:14,marginBottom:6,cursor:"pointer",opacity:d?0.4:1,transition:"opacity .15s"}}>
                          <div style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${d?pillar.color:"#333"}`,background:d?pillar.color:"transparent",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                            {d&&<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:14,color:d?"#444":"#c8c5be",textDecoration:d?"line-through":"none",lineHeight:1.4}}>{q.title}</div>
                            <div style={{fontSize:11,color:"#444",marginTop:4,fontFamily:MONO}}>Due {q.deadline}</div>
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
          {view==="profile"&&(
            <div style={{padding:"0 16px"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingBottom:24,borderBottom:"1px solid #111",marginBottom:24}}>
                <div style={{position:"relative",marginBottom:14}} onClick={()=>fileRef.current.click()}>
                  {photo
                    ?<img src={photo} alt={displayName} style={{width:90,height:90,borderRadius:"50%",objectFit:"cover",border:"2px solid #222",cursor:"pointer"}}/>
                    :<div style={{width:90,height:90,borderRadius:"50%",background:"#111",border:`1px solid ${isFounder?"#F5C84244":"#222"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,fontWeight:700,color:nameColor,cursor:"pointer"}}>{displayName[0].toUpperCase()}</div>
                  }
                  <div style={{position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:"50%",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9.5 1.5l2 2-7 7H2.5v-2l7-7z" stroke="#000" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
                </div>

                {/* Name + founder badge */}
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <div style={{fontSize:22,fontWeight:700,color:nameColor,letterSpacing:-0.3}}>{displayName}</div>
                  {isFounder&&<FounderBadge/>}
                </div>

                {profile?.username&&<div style={{fontSize:12,color:"#555",marginBottom:6}}>@{profile.username}</div>}
                <InlineEdit value={tagline} placeholder="Your seeking in 3–5 words…" onSave={saveTagline} F={F} style={{fontSize:13,color:"#555",letterSpacing:0.3,textAlign:"center"}}/>
                <div style={{fontSize:11,color:"#333",marginTop:6}}>Seeker · Day {daysSince()}</div>
                <div style={{width:"100%",marginTop:16}}>
                  <InlineEdit value={bio} placeholder="What are you seeking? Tap to write your bio." onSave={saveBio} multiline F={F} style={{fontSize:14,color:"#c8c5be",lineHeight:1.6,textAlign:"center"}}/>
                </div>
                <div style={{width:"100%",marginTop:16,background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:12,padding:"10px 14px"}}>
                  <div style={{fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Current obsession</div>
                  <InlineEdit value={obsession} placeholder="What are you deep into right now?" onSave={saveObsession} F={F} style={{fontSize:14,color:"#e0ddd8",fontWeight:500}}/>
                </div>
              </div>

              <div style={{marginBottom:4}}>
                <div style={{fontSize:10,color:"#444",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Pinned</div>
                <PinnedNote note={pinnedNote} pillarColor={pinnedColor} onEdit={()=>setShowPinModal(true)} onClear={clearPinned} F={F}/>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                {[{n:`${overall()}%`,l:"Overall",blur:false},{n:daysLogged,l:"Days logged",blur:incognito},{n:streak,l:"Streak",blur:incognito},{n:questsDone,l:"Quests",blur:false}].map(st=>(
                  <div key={st.l} style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:16,padding:"16px 14px"}}>
                    <div style={{fontSize:24,fontWeight:700,color:"#fff",filter:st.blur?"blur(8px)":"none",transition:"filter .3s",userSelect:st.blur?"none":"auto"}}>{st.n}</div>
                    <div style={{fontSize:11,color:"#555",marginTop:3,textTransform:"uppercase",letterSpacing:0.5}}>{st.l}</div>
                  </div>
                ))}
              </div>

              <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:20,padding:"18px 16px",marginBottom:16}}>
                <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>{stackLabel}</div>
                {PILLARS.map(p=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
                    <span style={{fontSize:13,color:"#888",minWidth:80}}>{p.label}</span>
                    <div style={{flex:1,height:4,background:"#1a1a1a",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pillarAllTime(p.id)}%`,background:p.color,borderRadius:2,transition:"width .5s ease"}}/>
                    </div>
                    <span style={{fontSize:11,color:"#555",minWidth:32,textAlign:"right",fontFamily:MONO}}>{pillarAllTime(p.id)}%</span>
                  </div>
                ))}
              </div>

              <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:20,padding:"18px 16px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1}}>Side Quests</div>
                  <div style={{fontSize:11,color:"#555",fontFamily:MONO}}>{questsDone}/{SIDE_QUESTS.length}</div>
                </div>
                <div style={{height:3,background:"#1a1a1a",borderRadius:2,marginBottom:14,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(questsDone/SIDE_QUESTS.length)*100}%`,background:"#C084FC",borderRadius:2,transition:"width .5s ease"}}/>
                </div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {SIDE_QUESTS.map(q=>{
                    const pc=PILLARS.find(p=>p.id===q.pillar)?.color;
                    return<div key={q.id} style={{width:11,height:11,borderRadius:"50%",background:quests[q.id]?pc:"#1a1a1a",border:`1px solid ${quests[q.id]?pc:"#2a2a2a"}`,transition:"all .3s"}}/>;
                  })}
                </div>
              </div>

              <button onClick={signOut}
                style={{width:"100%",padding:"13px 0",background:"transparent",border:"1px solid #1a1a1a",borderRadius:14,fontSize:13,color:"#555",cursor:"pointer",fontFamily:F,marginBottom:20}}>
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM NAV */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(0,0,0,0.92)",borderTop:"1px solid #111",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",zIndex:100,paddingBottom:"env(safe-area-inset-bottom, 8px)"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",padding:"8px 0 4px"}}>
            {TABS.map(tab=>{
              const active=view===tab.id;
              return(
                <button key={tab.id} onClick={()=>setView(tab.id)}
                  style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"transparent",border:"none",cursor:"pointer",padding:"8px 0",opacity:active?1:0.6,transition:"opacity .15s"}}>
                  <tab.Icon a={active}/>
                  <span style={{fontSize:10,color:active?"#fff":"#555",fontFamily:F,fontWeight:active?600:400,letterSpacing:0.3}}>{tab.label}</span>
                  {active&&<div style={{width:4,height:4,borderRadius:"50%",background:"#fff",marginTop:-2}}/>}
                </button>
              );
            })}
          </div>
        </div>

        {showPinModal&&<PinNoteModal initial={pinnedNote} onSave={savePinned} onClose={()=>setShowPinModal(false)} F={F}/>}
      </div>
    </div>
  );
}
