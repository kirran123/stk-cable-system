import { useState, useEffect } from 'react';

const CHANNELS = [
  { num: 'CH 01', name: 'NEWS 24HD',   color: '#6366f1', icon: '📰' },
  { num: 'CH 05', name: 'SPORTS MAX',  color: '#06b6d4', icon: '⚽' },
  { num: 'CH 12', name: 'MOVIES PLUS', color: '#ec4899', icon: '🎬' },
  { num: 'CH 24', name: 'MUSIC TV',    color: '#f59e0b', icon: '🎵' },
  { num: 'CH 36', name: 'INFO PRIME',  color: '#10b981', icon: '📡' },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [chIndex, setChIndex] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [signalStrength, setSignalStrength] = useState(4);

  /* Auto-advance channels every 2.5 s */
  useEffect(() => {
    const id = setInterval(() => {
      setSwitching(true);
      setTimeout(() => {
        setChIndex(i => (i + 1) % CHANNELS.length);
        setSwitching(false);
      }, 350);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  /* Fluctuate signal strength */
  useEffect(() => {
    const id = setInterval(() => {
      setSignalStrength(3 + Math.floor(Math.random() * 2)); // 3 or 4 bars
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    const ALLOWED = { sudhakar: 'sudhakar14', kishore: 'kishore14', kirran: 'kirran14', cable: 'cable' };
    if (ALLOWED[username] === password) {
      onLogin({ username, role: username === 'cable' ? 'viewer' : 'admin' });
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const ch = CHANNELS[chIndex];

  return (
    <div style={s.root}>
      <style>{CSS}</style>

      {/* ─── Background: subtle dot-grid ─── */}
      <div style={s.dotGrid} />

      {/* ─── Background broadcast rings (top-left) ─── */}
      <div style={s.towerArea}>
        <div style={s.towerIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4.9 4.9a10 10 0 0 1 14.2 0M7.7 7.7a6 6 0 0 1 8.6 0M10.5 10.5a2 2 0 0 1 3 0" />
            <line x1="12" y1="12" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </div>
        <div className="ring r1" />
        <div className="ring r2" />
        <div className="ring r3" />
      </div>

      {/* ─── Right-side cable-signal line decoration ─── */}
      <svg style={s.waveSvg} viewBox="0 0 400 900" preserveAspectRatio="none">
        <path className="cable-line" d="M380,0 Q340,200 370,400 Q400,600 360,900" stroke="rgba(99,102,241,0.2)" strokeWidth="2" fill="none" strokeDasharray="8 6"/>
        <path className="cable-line" style={{animationDelay:'-2s'}} d="M340,0 Q310,250 330,500 Q350,700 320,900" stroke="rgba(6,182,212,0.15)" strokeWidth="1.5" fill="none" strokeDasharray="6 8"/>
      </svg>

      {/* ─── Main Column ─── */}
      <div style={s.col}>

        {/* TV Unit */}
        <div style={s.tvUnit}>

          {/* TV Frame */}
          <div style={s.tvFrame}>
            {/* Antenna */}
            <div style={s.antennaWrap}>
              <div style={{ ...s.antenna, transform: 'rotate(-30deg)', left: '32%' }} />
              <div style={{ ...s.antenna, transform: 'rotate(30deg)',  left: '58%' }} />
            </div>

            {/* Screen */}
            <div style={s.screen}>
              {switching ? (
                /* Static / channel-change flash */
                <div style={s.static}>
                  {Array.from({length: 60}).map((_,i) => (
                    <span key={i} style={{
                      position: 'absolute',
                      left:   `${(i * 17) % 100}%`,
                      top:    `${(i * 23) % 100}%`,
                      width:  i % 3 === 0 ? 6 : 3,
                      height: i % 5 === 0 ? 6 : 2,
                      background: i % 2 ? '#fff' : '#222',
                      opacity: 0.7,
                    }} />
                  ))}
                  <div style={s.staticText}>— CHANGING CHANNEL —</div>
                </div>
              ) : (
                <>
                  {/* CRT scanline */}
                  <div className="crt-sweep" />

                  {/* Top bar */}
                  <div style={s.screenTopBar}>
                    <span style={{ ...s.chBadge, color: ch.color, borderColor: ch.color + '55', background: ch.color + '15' }}>
                      {ch.num}
                    </span>
                    <span style={{ ...s.chName }}>{ch.name}</span>
                    <span style={s.liveDot} className="blink">● LIVE</span>
                  </div>

                  {/* Channel graphic — coloured gradient fill */}
                  <div style={{ ...s.chGraphic, background: `radial-gradient(ellipse at 40% 50%, ${ch.color}22 0%, transparent 70%)` }}>
                    <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{ch.icon}</div>
                    <div style={{ color: ch.color, fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{ch.name}</div>
                    <div style={{ color: '#475569', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>STK Cable Network</div>
                  </div>

                  {/* Bottom signal bar */}
                  <div style={s.screenBottom}>
                    <div style={s.signalWrap}>
                      {[1,2,3,4].map(b => (
                        <div key={b} style={{
                          width: 5,
                          height: 6 + b * 4,
                          borderRadius: 3,
                          background: b <= signalStrength ? '#10b981' : '#1e293b',
                          transition: 'background 0.4s',
                        }} />
                      ))}
                      <span style={{ color: '#64748b', fontSize: '0.65rem', marginLeft: 4 }}>SIGNAL</span>
                    </div>
                    <span style={{ color: '#334155', fontSize: '0.65rem' }}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* TV bottom bezel */}
            <div style={s.bezel}>
              <div style={s.powerLed} className="blink-led" />
              <div style={s.controlDots}>
                {[0,1,2].map(i => <div key={i} style={s.dot} />)}
              </div>
            </div>
          </div>

          {/* TV stand */}
          <div style={s.stand}>
            <div style={s.standNeck} />
            <div style={s.standBase} />
          </div>
        </div>

        {/* ─── Login Card ─── */}
        <div style={s.card}>
          <div style={s.cardLogo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="15" rx="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>
          </div>
          <h2 style={s.cardTitle}>STK Cable System</h2>
          <p style={s.cardSub}>Sign in to your network portal</p>

          {error && (
            <div style={s.errBox}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={s.fg}>
              <label style={s.label}>Username</label>
              <input
                style={s.inp}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoComplete="username"
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ ...s.fg, marginBottom: '1.5rem' }}>
              <label style={s.label}>Password</label>
              <input
                style={s.inp}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button type="submit" style={s.btn}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(99,102,241,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; }}
            >
              <span style={s.shimmer} className="shimmer" />
              📡 Connect to Network
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────── STYLES ──────────────────────────────── */
const s = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #06080f 0%, #0b0f1e 60%, #070b18 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter', system-ui, sans-serif",
    position: 'relative', overflow: 'hidden',
  },
  dotGrid: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: 'radial-gradient(rgba(99,102,241,0.12) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    mask: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)',
  },
  towerArea: {
    position: 'absolute', top: 30, left: 40,
    width: 120, height: 120,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  towerIcon: {
    position: 'relative', zIndex: 2,
    width: 48, height: 48, borderRadius: 12,
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  waveSvg: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 400, height: '100%', pointerEvents: 'none',
  },
  col: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 0, position: 'relative', zIndex: 10,
  },

  /* ─── TV ─── */
  tvUnit: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  tvFrame: {
    width: 380, position: 'relative',
    background: 'linear-gradient(160deg, #1a2238 0%, #0f1729 100%)',
    border: '2px solid #253352',
    borderRadius: '16px 16px 8px 8px',
    padding: '24px 18px 12px',
    boxShadow: '0 0 60px rgba(99,102,241,0.2), 0 20px 50px rgba(0,0,0,0.7)',
  },
  antennaWrap: {
    position: 'absolute', top: -32, left: 0, right: 0,
    display: 'flex', justifyContent: 'center',
  },
  antenna: {
    position: 'absolute',
    width: 3, height: 34,
    background: 'linear-gradient(180deg, #64748b, #1e293b)',
    borderRadius: 4, transformOrigin: 'bottom center',
    bottom: 0,
  },
  screen: {
    width: '100%', height: 195,
    background: '#050810',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6), 0 0 0 2px #0a0e1a',
  },
  static: {
    position: 'absolute', inset: 0,
    background: '#080c16',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  staticText: {
    position: 'relative', zIndex: 2,
    fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.15em', fontWeight: 600,
  },
  screenTopBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px 6px',
  },
  chBadge: {
    fontSize: '0.65rem', fontWeight: 800,
    padding: '2px 8px', borderRadius: 99,
    border: '1px solid',
    letterSpacing: '0.06em',
  },
  chName: {
    fontSize: '0.72rem', fontWeight: 700,
    color: '#94a3b8', letterSpacing: '0.08em',
    flex: 1,
  },
  liveDot: {
    fontSize: '0.6rem', color: '#ef4444', fontWeight: 700,
  },
  chGraphic: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingTop: 28,
  },
  screenBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '6px 12px',
    background: 'rgba(0,0,0,0.5)',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  signalWrap: {
    display: 'flex', alignItems: 'flex-end', gap: 3,
  },
  bezel: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 4px 0',
  },
  powerLed: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px #10b981',
  },
  controlDots: {
    display: 'flex', gap: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#253352',
    border: '1px solid #334155',
  },
  stand: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  standNeck: {
    width: 56, height: 14,
    background: 'linear-gradient(180deg, #1a2238, #253352)',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
  },
  standBase: {
    width: 120, height: 8,
    background: 'linear-gradient(90deg, #0f1729, #1a2238, #0f1729)',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  },

  /* ─── Login Card ─── */
  card: {
    width: 380, marginTop: 0,
    background: 'rgba(11, 16, 30, 0.9)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderTop: 'none',
    borderRadius: '0 0 20px 20px',
    padding: '1.5rem 2rem 2rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
  },
  cardLogo: {
    width: 40, height: 40, borderRadius: 10,
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem',
    boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
  },
  cardTitle: {
    fontSize: '1.25rem', fontWeight: 800,
    color: '#f8fafc', textAlign: 'center',
    marginBottom: '0.25rem', letterSpacing: '-0.02em',
  },
  cardSub: {
    fontSize: '0.8rem', color: '#64748b',
    textAlign: 'center', marginBottom: '1.5rem',
  },
  errBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, padding: '0.65rem 0.9rem',
    color: '#f87171', fontSize: '0.82rem',
    marginBottom: '1.25rem',
  },
  fg: {
    marginBottom: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.4rem',
  },
  label: {
    fontSize: '0.75rem', fontWeight: 600,
    color: '#64748b', letterSpacing: '0.03em',
  },
  inp: {
    width: '100%', padding: '0.65rem 0.9rem',
    background: 'rgba(10, 14, 26, 0.9)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8, color: '#f8fafc',
    fontSize: '0.9rem', outline: 'none',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '0.75rem',
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative', overflow: 'hidden',
    fontFamily: "'Inter', system-ui, sans-serif",
    letterSpacing: '-0.01em',
  },
  shimmer: {
    position: 'absolute', top: 0, bottom: 0, width: '40%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
    pointerEvents: 'none',
  },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  /* Broadcast rings */
  .ring {
    position: absolute; top: 50%; left: 50%;
    border-radius: 50%;
    border: 1.5px solid rgba(99,102,241,0.35);
    transform: translate(-50%, -50%);
    animation: ringOut 3s ease-out infinite;
  }
  .r1 { width: 60px;  height: 60px;  animation-delay: 0s; }
  .r2 { width: 95px;  height: 95px;  animation-delay: 0.9s; }
  .r3 { width: 130px; height: 130px; animation-delay: 1.8s; }

  @keyframes ringOut {
    0%   { opacity: 0.7; transform: translate(-50%,-50%) scale(0.6); }
    100% { opacity: 0;   transform: translate(-50%,-50%) scale(1); }
  }

  /* CRT scan-line sweep */
  .crt-sweep {
    position: absolute; left: 0; right: 0; height: 3px;
    background: linear-gradient(180deg, transparent, rgba(255,255,255,0.06) 50%, transparent);
    animation: crtDown 2.5s linear infinite;
    pointer-events: none; z-index: 5;
  }
  @keyframes crtDown {
    from { top: -4px; }
    to   { top: 100%; }
  }

  /* Live badge blink */
  .blink { animation: ledBlink 1.2s ease-in-out infinite; }
  .blink-led { animation: ledBlink 2s ease-in-out infinite; }
  @keyframes ledBlink {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.25; }
  }

  /* Shimmer on button */
  .shimmer { animation: shimmerSlide 2.5s ease-in-out infinite; }
  @keyframes shimmerSlide {
    from { left: -60%; }
    to   { left: 140%; }
  }

  /* Cable wire path dash animation */
  .cable-line { animation: dashMove 4s linear infinite; }
  @keyframes dashMove {
    from { stroke-dashoffset: 0; }
    to   { stroke-dashoffset: -60; }
  }
`;
