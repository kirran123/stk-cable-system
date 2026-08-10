import { useState } from 'react';

const ALLOWED_USERS = {
  sudhakar: 'sudhakar14',
  kishore: 'kishore14',
  kirran: 'kirran14',
  cable: 'cable',
};

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ALLOWED_USERS[username] === password) {
      const role = username === 'cable' ? 'viewer' : 'admin';
      onLogin({ username, role });
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="login-root-neat">
      <div className="login-bg-glow glow-1"></div>
      <div className="login-bg-glow glow-2"></div>

      <div className="login-card-neat">
        <div className="login-logo-box">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
            <polyline points="17 2 12 7 7 2"></polyline>
          </svg>
        </div>

        <h2 className="login-title">STK Cable System</h2>
        <p className="login-sub">Network Management Portal</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group-item" style={{ marginBottom: '1.25rem' }}>
            <label className="form-group-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="input-neat"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group-item" style={{ marginBottom: '1.75rem' }}>
            <label className="form-group-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-neat"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}>
            Sign In to Dashboard →
          </button>
        </form>
      </div>
    </div>
  );
}
