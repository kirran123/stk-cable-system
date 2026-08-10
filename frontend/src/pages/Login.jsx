import { useState, useEffect } from 'react';

const ALLOWED_USERS = {
  sudhakar: 'sudhakar14',
  kishore: 'kishore14',
  kirran: 'kirran14',
  cable: 'cable',
};

/* Animated TV channel cards shown in background */
const TV_CHANNELS = [
  { ch: '01', label: 'News HD', color: '#6366f1' },
  { ch: '05', label: 'Sports', color: '#06b6d4' },
  { ch: '12', label: 'Movies', color: '#ec4899' },
  { ch: '24', label: 'Kids', color: '#f59e0b' },
  { ch: '36', label: 'Music', color: '#10b981' },
  { ch: '48', label: 'Info', color: '#8b5cf6' },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signal, setSignal] = useState(100);
  const [currentCh, setCurrentCh] = useState(0);
  const [showStatic, setShowStatic] = useState(false);

  /* Cycle through channels every 3s (simulates flipping channels) */
  useEffect(() => {
    const interval = setInterval(() => {
      setShowStatic(true);
      setTimeout(() => {
        setCurrentCh(prev => (prev + 1) % TV_CHANNELS.length);
        setShowStatic(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* Animate signal bars */
  useEffect(() => {
    const tick = setInterval(() => {
      setSignal(85 + Math.floor(Math.random() * 15));
    }, 1500);
    return () => clearInterval(tick);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ALLOWED_USERS[username] === password) {
      const role = username === 'cable' ? 'viewer' : 'admin';
      onLogin({ username, role });
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const ch = TV_CHANNELS[currentCh];

  return (
    <div style={styles.root}>
      {/* ── Full-screen animated background ── */}
      <div style={styles.bg}>
        {/* Scrolling scan-line overlay */}
        <div style={styles.scanlines}></div>

        {/* Animated signal-wave rings */}
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ ...styles.ring, animationDelay: `${i * 0.6}s`, width: i * 180, height: i * 180 }} />
        ))}

        {/* Floating mini TV cards */}
        {TV_CHANNELS.map((c, i) => (
          <div
            key={c.ch}
            style={{
              ...styles.floatCard,
              left: `${10 + (i % 3) * 30}%`,
              top: `${15 + Math.floor(i / 3) * 50}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${6 + i}s`,
              borderColor: c.color + '55',
              boxShadow: `0 0 20px ${c.color}33`,
            }}
          >
            <div style={{ ...styles.floatCardDot, background: c.color }} />
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.08em' }}>CH {c.ch}</span>
            <span style={{ fontSize: '0.65rem', color: c.color, fontWeight: 700 }}>{c.label}</span>
          </div>
        ))}

        {/* Moving cable wire lines */}
        <svg style={styles.wireSvg} viewBox="0 0 1440 900" preserveAspectRatio="none">
          <path d="M0,200 Q360,100 720,300 T1440,200" stroke="rgba(99,102,241,0.12)" strokeWidth="2" fill="none" style={{ animation: 'wirePulse 4s ease-in-out infinite' }} />
          <path d="M0,600 Q360,500 720,700 T1440,600" stroke="rgba(6,182,212,0.1)" strokeWidth="2" fill="none" style={{ animation: 'wirePulse 5s ease-in-out infinite reverse' }} />
          <path d="M0,400 Q480,250 960,500 T1440,350" stroke="rgba(236,72,153,0.08)" strokeWidth="1.5" fill="none" style={{ animation: 'wirePulse 6s ease-in-out infinite' }} />
        </svg>

        {/* Top-left: broadcast tower icon */}
        <div style={styles.towerBox}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4.9 4.9a10 10 0 0 1 14.2 0M7.7 7.7a6 6 0 0 1 8.6 0M10.5 10.5a2 2 0 0 1 3 0" />
            <line x1="12" y1="12" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
          <div style={{ ...styles.towerPulse, animationDelay: '0s' }} />
          <div style={{ ...styles.towerPulse, animationDelay: '0.5s', width: 60, height: 60 }} />
        </div>
      </div>

      {/* ── Main centered content ── */}
      <div style={styles.center}>
        {/* Mock TV screen above the card */}
        <div style={styles.tvScreen}>
          {showStatic ? (
            <div style={styles.staticNoise}>
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: Math.random() > 0.5 ? 4 : 2,
                    height: Math.random() > 0.5 ? 4 : 2,
                    background: Math.random() > 0.5 ? '#fff' : '#333',
                    opacity: Math.random(),
                  }}
                />
              ))}
            </div>
          ) : (
            <div style={styles.tvContent}>
              {/* TV CRT scanline */}
              <div style={styles.crtLine} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <span style={{ ...styles.tvLabel, color: ch.color }}>CH {ch.ch} • {ch.label}</span>
                <div style={styles.recBadge}>● LIVE</div>
              </div>
              <div style={styles.tvBars}>
                {[...Array(18)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1, borderRadius: 2,
                      background: `hsl(${220 + i * 8}, 70%, ${35 + i * 2}%)`,
                      height: `${30 + Math.sin(i) * 20 + Math.random() * 15}%`,
                      alignSelf: 'flex-end',
                    }}
                  />
                ))}
              </div>
              <div style={styles.tvBottom}>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>STK CABLE NETWORK</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{
                      width: 6, height: signal > (i + 1) * 20 ? 14 : 8,
                      background: signal > (i + 1) * 20 ? '#10b981' : '#1e293b',
                      borderRadius: 2, transition: 'height 0.4s ease',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* TV bezel details */}
          <div style={styles.tvBezel} />
          <div style={styles.tvLed} />
        </div>

        {/* TV "neck" connector */}
        <div style={styles.tvNeck} />

        {/* Login Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                <polyline points="17 2 12 7 7 2" />
              </svg>
            </div>
            <div>
              <div style={styles.cardTitle}>STK Cable System</div>
              <div style={styles.cardSub}>Network Management Portal</div>
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Username</label>
              <input
                type="text"
                style={styles.input}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div style={{ ...styles.inputGroup, marginBottom: '1.75rem' }}>
              <label style={styles.inputLabel}>Password</label>
              <input
                type="password"
                style={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <button type="submit" style={styles.submitBtn}
              onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
            >
              <span style={styles.btnShimmer} />
              📡 Connect to Network
            </button>
          </form>
        </div>
      </div>

      {/* Keyframe injector */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes ringPulse {
          0%   { transform: scale(0.6); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes floatUp {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes wirePulse {
          0%,100% { stroke-dashoffset: 0; opacity: 0.7; }
          50%      { stroke-dashoffset: 30; opacity: 1; }
        }
        @keyframes towerPing {
          0%   { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        @keyframes scanMove {
          0%   { background-position: 0 0; }
          100% { background-position: 0 100px; }
        }
        @keyframes crtScroll {
          from { top: -100%; }
          to   { top: 200%; }
        }
        @keyframes ledBlink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.2; }
        }
        @keyframes shimmer {
          from { left: -100%; }
          to   { left: 150%; }
        }
      `}</style>
    </div>
  );
}

/* ── STYLES ── */
const styles = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #05070f 0%, #0b0f1e 50%, #070d1a 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  bg: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
  },
  scanlines: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
    animation: 'scanMove 8s linear infinite',
    zIndex: 1,
  },
  ring: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    border: '1.5px solid rgba(99,102,241,0.18)',
    borderRadius: '50%',
    animation: 'ringPulse 4s ease-out infinite',
    pointerEvents: 'none',
  },
  floatCard: {
    position: 'absolute',
    display: 'flex', flexDirection: 'column', gap: 4,
    padding: '10px 14px',
    background: 'rgba(13, 19, 34, 0.75)',
    border: '1px solid',
    borderRadius: 10,
    backdropFilter: 'blur(8px)',
    animation: 'floatUp ease-in-out infinite',
    zIndex: 0,
  },
  floatCardDot: {
    width: 6, height: 6, borderRadius: '50%',
  },
  wireSvg: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    strokeDasharray: '10 5',
  },
  towerBox: {
    position: 'absolute', top: 30, right: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 60, height: 60,
  },
  towerPulse: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 40, height: 40, borderRadius: '50%',
    border: '2px solid rgba(99,102,241,0.4)',
    animation: 'towerPing 2s ease-out infinite',
  },
  center: {
    position: 'relative', zIndex: 10,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  tvScreen: {
    width: 360,
    height: 200,
    background: '#0a0e1a',
    border: '8px solid #1e2940',
    borderBottom: '6px solid #1e2940',
    borderRadius: '14px 14px 4px 4px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 0 60px rgba(99,102,241,0.3), inset 0 0 30px rgba(0,0,0,0.5)',
  },
  tvContent: {
    position: 'absolute', inset: 0,
    padding: '10px 14px',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  },
  tvLabel: {
    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
  },
  recBadge: {
    fontSize: '0.6rem', color: '#ef4444', fontWeight: 700,
    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
    padding: '2px 6px', borderRadius: 99,
    animation: 'ledBlink 1.2s ease-in-out infinite',
  },
  tvBars: {
    display: 'flex', gap: 3, height: 70, alignItems: 'flex-end',
  },
  tvBottom: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  crtLine: {
    position: 'absolute', left: 0, right: 0,
    height: 2,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
    animation: 'crtScroll 3s linear infinite',
    pointerEvents: 'none',
  },
  tvBezel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 3,
    background: 'linear-gradient(90deg, rgba(99,102,241,0.5), rgba(6,182,212,0.5), rgba(99,102,241,0.5))',
    animation: 'shimmer 3s linear infinite',
  },
  tvLed: {
    position: 'absolute', bottom: -18, right: 20,
    width: 8, height: 8, borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px #10b981',
    animation: 'ledBlink 2s ease-in-out infinite',
  },
  staticNoise: {
    position: 'absolute', inset: 0,
    background: '#111',
    overflow: 'hidden',
  },
  tvNeck: {
    width: 60, height: 14,
    background: 'linear-gradient(180deg, #1e2940, #253352)',
    clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
  },
  card: {
    width: 380,
    background: 'rgba(13, 19, 34, 0.92)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0 0 18px 18px',
    padding: '1.75rem 2rem 2rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(99,102,241,0.15)',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: '0.85rem',
    marginBottom: '1.5rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  logoIcon: {
    width: 42, height: 42, borderRadius: 12,
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em',
  },
  cardSub: {
    fontSize: '0.75rem', color: '#64748b', marginTop: 2,
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, padding: '0.7rem 1rem',
    color: '#f87171', fontSize: '0.82rem', marginBottom: '1.25rem',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  inputLabel: {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: '#64748b', marginBottom: '0.4rem', letterSpacing: '0.03em',
  },
  input: {
    width: '100%', padding: '0.65rem 0.9rem',
    background: 'rgba(15, 22, 36, 0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#f8fafc',
    fontSize: '0.9rem', outline: 'none',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%', padding: '0.75rem',
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    color: '#fff', border: 'none', borderRadius: 8,
    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(99,102,241,0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative', overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  btnShimmer: {
    position: 'absolute', top: 0, bottom: 0,
    width: '40%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
    animation: 'shimmer 2.5s ease-in-out infinite',
    pointerEvents: 'none',
  },
};
