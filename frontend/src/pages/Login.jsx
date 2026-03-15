import { useState } from 'react';

const ALLOWED_USERS = {
  sudhakar: 'sudhakar14',
  kishore: 'kishore14',
  kirran: 'kirran14',
};

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ALLOWED_USERS[username] === password) {
      onLogin({ username });
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-wrapper">
      {/* Massive Left Side Animation */}
      <div className="side-animation left-side">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-3"></div>
        <div className="cable-line line-1"></div>
        <div className="cable-line line-2"></div>
      </div>

      <div className="login-form-container">
        <div className="glass-panel stagger-1 login-panel">
          <div className="hero-logo-container stagger-2" style={{ margin: '0 auto 1.5rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
              <polyline points="17 2 12 7 7 2"></polyline>
            </svg>
          </div>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem', textAlign: 'center' }} className="text-gradient">STK Cable</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.95rem', textAlign: 'center' }}>
            Premium Network Management
          </p>
          
          {error && (
            <div className="animate-enter" style={{ background: 'rgba(225, 29, 72, 0.2)', color: '#fb7185', border: '1px solid rgba(225, 29, 72, 0.5)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }} className="stagger-3">
            <div className="input-group">
              <label className="input-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Name"
                required
              />
            </div>
            <div className="input-group" style={{ marginBottom: '2.5rem' }}>
              <label className="input-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary stagger-4" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', animationDelay: '0.5s' }}>
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>

      {/* Massive Right Side Animation */}
      <div className="side-animation right-side">
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-4"></div>
        <div className="cable-line line-3"></div>
        <div className="cable-line line-4"></div>
      </div>
    </div>
  );
}
