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
      setError('Invalid username or password. Please check your credentials.');
    }
  };

  return (
    <div className="login-root">
      {/* Left Branding Side */}
      <div className="login-left">
        <div className="login-orb orb-1"></div>
        <div className="login-orb orb-2"></div>
        <div className="login-orb orb-3"></div>

        <div className="login-left-content">
          <div className="login-big-icon">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
              <polyline points="17 2 12 7 7 2"></polyline>
            </svg>
          </div>

          <h1 className="login-hero-title">
            STK Cable <br />
            <span className="text-gradient">System</span>
          </h1>

          <p className="login-hero-sub">
            Enterprise cable network management with instant Google Sheets & Convex cloud database synchronization.
          </p>

          <div className="login-feature">
            <div className="login-feature-dot" />
            <span>Multi-month payment calculation & reset tracking</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-dot" />
            <span>Dual cloud sync for high availability & reliability</span>
          </div>
          <div className="login-feature">
            <div className="login-feature-dot" />
            <span>Comprehensive payment history audit log</span>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="login-right">
        <div className="login-form-box">
          <div className="login-form-header">
            <h2 className="login-form-title">Welcome back</h2>
            <p className="login-form-sub">Sign in to access your STK Cable portal</p>
          </div>

          {error && (
            <div className="error-box">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn">
              <span className="login-btn-shimmer" />
              Sign In to Dashboard →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
