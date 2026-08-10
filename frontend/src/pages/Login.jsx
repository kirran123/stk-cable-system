import { useState, useEffect, useRef } from 'react';

const CHANNELS = [
  { num: '01', name: 'NEWS 24HD',   color: '#6366f1', icon: '📰' },
  { num: '05', name: 'SPORTS MAX',  color: '#06b6d4', icon: '⚽' },
  { num: '12', name: 'MOVIES PLUS', color: '#ec4899', icon: '🎬' },
  { num: '24', name: 'MUSIC TV',    color: '#f59e0b', icon: '🎵' },
  { num: '36', name: 'INFO PRIME',  color: '#10b981', icon: '📡' },
];

const FLOATERS = [
  { ch: 'CH 01', label: 'NEWS HD',   color: '#6366f1', x: '6%',  dur: 9,  delay: 0   },
  { ch: 'CH 05', label: 'SPORTS',    color: '#06b6d4', x: '82%', dur: 11, delay: 2   },
  { ch: 'CH 12', label: 'MOVIES',    color: '#ec4899', x: '14%', dur: 13, delay: 5   },
  { ch: 'CH 24', label: 'MUSIC',     color: '#f59e0b', x: '72%', dur: 10, delay: 3.5 },
  { ch: 'CH 36', label: 'INFO',      color: '#10b981', x: '88%', dur: 12, delay: 1   },
  { ch: 'CH 48', label: 'KIDS',      color: '#a78bfa', x: '3%',  dur: 14, delay: 6   },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [chIdx, setChIdx]       = useState(0);
  const [switching, setSwitching] = useState(false);
  const [sigBars, setSigBars]   = useState(4);
  const [time, setTime]         = useState('');
  const timerRef = useRef(null);

  /* Clock */
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* Channel cycling */
  useEffect(() => {
    const id = setInterval(() => {
      setSwitching(true);
      setTimeout(() => { setChIdx(i => (i + 1) % CHANNELS.length); setSwitching(false); }, 380);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  /* Signal flicker */
  useEffect(() => {
    const id = setInterval(() => setSigBars(3 + Math.floor(Math.random() * 2)), 1800);
    return () => clearInterval(id);
  }, []);

  /* Idle logout timer reset on input */
  const resetTimer = () => {
    clearTimeout(timerRef.current);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const ALLOWED = { sudhakar: 'sudhakar14', kishore: 'kishore14', kirran: 'kirran14', cable: 'cable' };
    if (ALLOWED[username] === password) {
      onLogin({ username, role: username === 'cable' ? 'viewer' : 'admin' });
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const ch = CHANNELS[chIdx];

  return (
    <div style={s.root}>
      <style>{CSS}</style>

      {/* ── dot-grid background ── */}
      <div style={s.dotGrid} />

      {/* ── broadcast rings (top-left) ── */}
      <div style={s.tower}>
        <div style={s.towerIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4.9 4.9a10 10 0 0 1 14.2 0M7.7 7.7a6 6 0 0 1 8.6 0M10.5 10.5a2 2 0 0 1 3 0"/>
            <line x1="12" y1="12" x2="12" y2="22"/>
            <line x1="8"  y1="22" x2="16" y2="22"/>
          </svg>
        </div>
        <div className="ring ring1"/><div className="ring ring2"/><div className="ring ring3"/>
      </div>

      {/* ── floating channel tags ── */}
      {FLOATERS.map((f, i) => (
        <div key={i} className="floater"
          style={{
            left: f.x, bottom: '-60px',
            borderColor: f.color + '50',
            boxShadow: `0 0 18px ${f.color}22`,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
          }}>
          <span style={{ fontSize: '0.6rem', color: '#475569', letterSpacing: '0.07em' }}>{f.ch}</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: f.color }}>{f.label}</span>
        </div>
      ))}

      {/* ── cable wire SVG (right side) ── */}
      <svg style={s.wireSvg} viewBox="0 0 200 900" preserveAspectRatio="none">
        <path className="wire" d="M180,0 Q150,220 170,450 Q190,680 160,900" stroke="rgba(99,102,241,0.18)" strokeWidth="2" fill="none" strokeDasharray="10 7"/>
        <path className="wire" style={{animationDelay:'-3s'}} d="M140,0 Q120,260 135,500 Q150,740 125,900" stroke="rgba(6,182,212,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="7 9"/>
      </svg>

      {/* ── cable wire SVG (left side) ── */}
      <svg style={{ ...s.wireSvg, left: 0, right: 'auto', transform: 'scaleX(-1)' }} viewBox="0 0 200 900" preserveAspectRatio="none">
        <path className="wire" style={{animationDelay:'-1.5s'}} d="M180,0 Q150,220 170,450 Q190,680 160,900" stroke="rgba(236,72,153,0.1)" strokeWidth="1.5" fill="none" strokeDasharray="8 8"/>
      </svg>

      {/* ══════════ TV SET ══════════ */}
      <div style={s.tvWrap}>

        {/* Antennas */}
        <div style={s.antennaRow}>
          <div style={s.ant} className="ant-left"/>
          <div style={s.ant} className="ant-right"/>
        </div>

        {/* TV body */}
        <div style={s.tvBody}>

          {/* ─ Screen ─ */}
          <div style={s.screen}>

            {/* CRT sweep line */}
            <div className="crt-line"/>

            {/* Screen vignette */}
            <div style={s.vignette}/>

            {switching ? (
              /* Static flash */
              <div style={s.staticWrap}>
                {Array.from({length:72}).map((_,i)=>(
                  <span key={i} style={{
                    position:'absolute',
                    left:`${(i*19+7)%100}%`, top:`${(i*13+11)%100}%`,
                    width: i%3===0?6:3, height: i%4===0?4:2,
                    background: i%2?'#fff':'#111', opacity:0.65,
                  }}/>
                ))}
                <span style={s.staticLabel}>— SWITCHING CHANNEL —</span>
              </div>
            ) : (
              <div style={s.screenInner}>

                {/* ── Top HUD bar ── */}
                <div style={s.hud}>
                  <div style={{ ...s.chPill, background: ch.color + '20', borderColor: ch.color + '60', color: ch.color }}>
                    ▶ CH {ch.num} · {ch.name}
                  </div>
                  <div style={s.hudRight}>
                    <span style={s.liveTag} className="blink">● LIVE</span>
                    <span style={s.clock}>{time}</span>
                  </div>
                </div>

                {/* ── Login form area ── */}
                <div style={s.formArea}>
                  {/* Logo */}
                  <div style={s.logo}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="15" rx="2"/>
                      <polyline points="17 2 12 7 7 2"/>
                    </svg>
                  </div>
                  <h1 style={s.title}>STK Cable System</h1>
                  <p style={s.sub}>Network Management Portal</p>

                  {error && <div style={s.err}>⚠ {error}</div>}

                  <form onSubmit={handleSubmit} onChange={resetTimer} style={{ width: '100%' }}>
                    <div style={s.fg}>
                      <label style={s.lbl}>Username</label>
                      <input
                        style={s.inp} type="text"
                        value={username} onChange={e=>setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required autoComplete="username"
                        onFocus={e=>{e.target.style.borderColor='#6366f1';e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.2)';}}
                        onBlur={e =>{e.target.style.borderColor='rgba(255,255,255,0.12)';e.target.style.boxShadow='none';}}
                      />
                    </div>
                    <div style={{ ...s.fg, marginBottom:'1.2rem' }}>
                      <label style={s.lbl}>Password</label>
                      <input
                        style={s.inp} type="password"
                        value={password} onChange={e=>setPassword(e.target.value)}
                        placeholder="••••••••"
                        required autoComplete="current-password"
                        onFocus={e=>{e.target.style.borderColor='#6366f1';e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.2)';}}
                        onBlur={e =>{e.target.style.borderColor='rgba(255,255,255,0.12)';e.target.style.boxShadow='none';}}
                      />
                    </div>
                    <button type="submit" style={s.btn}
                      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(99,102,241,0.6)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(99,102,241,0.4)'; }}
                    >
                      <span className="shimmer"/>
                      📡 Connect to Network
                    </button>
                  </form>
                </div>

                {/* ── Bottom HUD bar ── */}
                <div style={s.hudBot}>
                  <div style={s.sigWrap}>
                    {[1,2,3,4].map(b=>(
                      <div key={b} style={{
                        width:4, height:5+b*4, borderRadius:3,
                        background: b<=sigBars ? '#10b981':'#1e293b',
                        transition:'background 0.4s',
                      }}/>
                    ))}
                    <span style={s.sigLabel}>SIGNAL</span>
                  </div>
                  <span style={s.copyright}>STK CABLE NETWORK © 2024</span>
                </div>

              </div>
            )}
          </div>

          {/* ─ Bezel row ─ */}
          <div style={s.bezel}>
            <div style={s.powerBtn} className="blink-led"/>
            <div style={s.brandText}>STK · CABLE TV</div>
            <div style={s.ctrlBtns}>
              {[0,1,2].map(i=><div key={i} style={s.ctrlBtn}/>)}
            </div>
          </div>
        </div>

        {/* Stand */}
        <div style={s.standNeck}/>
        <div style={s.standBase}/>
      </div>
    </div>
  );
}

/* ─────────────── STYLES ─────────────── */
const s = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(140deg, #05070f 0%, #0b0f1e 55%, #07091a 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter', system-ui, sans-serif",
    position: 'relative', overflow: 'hidden',
  },
  dotGrid: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: 'radial-gradient(rgba(99,102,241,0.13) 1px, transparent 1px)',
    backgroundSize: '30px 30px',
    WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)',
    maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)',
  },

  /* tower */
  tower: {
    position: 'absolute', top: 28, left: 36,
    width: 110, height: 110,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  towerIcon: {
    position: 'relative', zIndex: 2,
    width: 44, height: 44, borderRadius: 10,
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.28)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  /* wires */
  wireSvg: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 200, height: '100%', pointerEvents: 'none',
  },

  /* TV set */
  tvWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    position: 'relative', zIndex: 10,
  },
  antennaRow: {
    width: 380,
    display: 'flex', justifyContent: 'center',
    position: 'relative', height: 44,
  },
  ant: {
    position: 'absolute', bottom: 0,
    width: 3, height: 40, borderRadius: 4,
    background: 'linear-gradient(180deg, #94a3b8, #1e293b)',
    transformOrigin: 'bottom center',
  },
  tvBody: {
    width: 480,
    background: 'linear-gradient(160deg, #141d30 0%, #0d1425 100%)',
    border: '2.5px solid #1e2d48',
    borderRadius: '18px 18px 10px 10px',
    padding: '14px 14px 10px',
    boxShadow: '0 0 80px rgba(99,102,241,0.22), 0 24px 60px rgba(0,0,0,0.75)',
  },
  screen: {
    width: '100%', height: 460,
    background: '#060b17',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.7)',
  },
  vignette: {
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
    background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)',
    borderRadius: 10,
  },
  screenInner: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between',
  },

  /* HUD top */
  hud: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px',
    background: 'rgba(0,0,0,0.5)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  chPill: {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em',
    padding: '4px 12px', borderRadius: 99, border: '1px solid',
  },
  hudRight: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  liveTag: {
    fontSize: '0.62rem', fontWeight: 700, color: '#ef4444',
  },
  clock: {
    fontSize: '0.7rem', color: '#475569', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
  },

  /* Login form inside screen */
  formArea: {
    flex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem 2.5rem',
  },
  logo: {
    width: 44, height: 44, borderRadius: 12,
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 18px rgba(99,102,241,0.5)',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc',
    letterSpacing: '-0.02em', margin: '0 0 4px',
    textShadow: '0 0 20px rgba(99,102,241,0.4)',
  },
  sub: {
    fontSize: '0.78rem', color: '#475569', marginBottom: '1.25rem',
  },
  err: {
    width: '100%',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.35)',
    borderRadius: 8, padding: '0.6rem 0.85rem',
    color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem',
    boxSizing: 'border-box',
  },
  fg: {
    width: '100%', marginBottom: '0.85rem',
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
  },
  lbl: {
    fontSize: '0.72rem', fontWeight: 600,
    color: '#64748b', letterSpacing: '0.04em',
  },
  inp: {
    width: '100%', padding: '0.62rem 0.85rem',
    background: 'rgba(10,14,26,0.9)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, color: '#f1f5f9',
    fontSize: '0.88rem', outline: 'none',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '0.72rem',
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative', overflow: 'hidden',
    fontFamily: "'Inter', system-ui, sans-serif",
    letterSpacing: '-0.01em',
  },

  /* HUD bottom */
  hudBot: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 16px',
    background: 'rgba(0,0,0,0.5)',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  sigWrap: {
    display: 'flex', alignItems: 'flex-end', gap: 3,
  },
  sigLabel: {
    fontSize: '0.6rem', color: '#334155', marginLeft: 5, letterSpacing: '0.07em',
  },
  copyright: {
    fontSize: '0.6rem', color: '#1e293b', letterSpacing: '0.08em',
  },

  /* Static */
  staticWrap: {
    position: 'absolute', inset: 0,
    background: '#070c18',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  staticLabel: {
    position: 'relative', zIndex: 2,
    fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.18em', fontWeight: 600,
  },

  /* Bezel */
  bezel: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 6px 2px',
  },
  powerBtn: {
    width: 9, height: 9, borderRadius: '50%',
    background: '#10b981', boxShadow: '0 0 8px #10b981',
  },
  brandText: {
    fontSize: '0.65rem', color: '#1e3a5f', fontWeight: 700,
    letterSpacing: '0.12em',
  },
  ctrlBtns: { display: 'flex', gap: 8 },
  ctrlBtn: {
    width: 9, height: 9, borderRadius: '50%',
    background: '#1a2a40', border: '1px solid #253352',
  },

  /* Stand */
  standNeck: {
    width: 64, height: 16,
    background: 'linear-gradient(180deg, #141d30, #1e2d48)',
    clipPath: 'polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)',
  },
  standBase: {
    width: 140, height: 10,
    background: 'linear-gradient(90deg, #0d1425, #1a2a40, #0d1425)',
    borderRadius: '0 0 10px 10px',
    boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
  },
};

/* ─────────────── CSS ANIMATIONS ─────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  /* Broadcast rings */
  .ring {
    position: absolute; top: 50%; left: 50%;
    border-radius: 50%;
    border: 1.5px solid rgba(99,102,241,0.4);
    transform: translate(-50%, -50%);
    animation: ringOut 3.2s ease-out infinite;
  }
  .ring1 { width: 56px;  height: 56px;  animation-delay: 0s;    }
  .ring2 { width: 90px;  height: 90px;  animation-delay: 1.0s;  }
  .ring3 { width: 124px; height: 124px; animation-delay: 2.0s;  }
  @keyframes ringOut {
    0%   { opacity: 0.8; transform: translate(-50%,-50%) scale(0.5); }
    100% { opacity: 0;   transform: translate(-50%,-50%) scale(1);   }
  }

  /* Antennas */
  .ant-left  { transform: rotate(-28deg); left: 36%; }
  .ant-right { transform: rotate(28deg);  left: 54%; }

  /* Floating channel tags */
  .floater {
    position: absolute;
    display: flex; flex-direction: column; gap: 3px;
    padding: 8px 12px;
    background: rgba(10,15,28,0.8);
    border: 1px solid;
    border-radius: 10px;
    backdrop-filter: blur(10px);
    animation: floatRise linear infinite;
    pointer-events: none;
  }
  @keyframes floatRise {
    0%   { transform: translateY(0)   rotate(-1deg); opacity: 0;   }
    8%   { opacity: 1; }
    92%  { opacity: 1; }
    100% { transform: translateY(-105vh) rotate(1deg); opacity: 0; }
  }

  /* CRT sweep */
  .crt-line {
    position: absolute; left: 0; right: 0; height: 3px;
    background: linear-gradient(180deg, transparent, rgba(255,255,255,0.055) 50%, transparent);
    animation: crtSweep 2.8s linear infinite;
    pointer-events: none; z-index: 6;
  }
  @keyframes crtSweep {
    from { top: -4px; }
    to   { top: 100%; }
  }

  /* Blink */
  .blink     { animation: blinkAnim 1.2s ease-in-out infinite; }
  .blink-led { animation: blinkAnim 2.2s ease-in-out infinite; }
  @keyframes blinkAnim {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.2; }
  }

  /* Shimmer on button */
  .shimmer {
    position: absolute; top: 0; bottom: 0; width: 45%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    animation: shimmerSlide 2.6s ease-in-out infinite;
    pointer-events: none; border-radius: inherit;
  }
  @keyframes shimmerSlide {
    from { left: -55%; }
    to   { left: 140%; }
  }

  /* Cable wire dash */
  .wire { animation: wireDash 4s linear infinite; }
  @keyframes wireDash {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -70; }
  }
`;
