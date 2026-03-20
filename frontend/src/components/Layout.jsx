import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function Layout({ user, onLogout }) {
  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      
      // Update last activity timestamp on every interaction
      localStorage.setItem('lastActivity', Date.now().toString());

      // 5 minutes timeout
      timeoutId = setTimeout(() => {
        onLogout();
      }, 5 * 60 * 1000);
    };

    // Set up event listeners for user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [onLogout]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="topbar">
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
              <polyline points="17 2 12 7 7 2"></polyline>
            </svg>
            <span className="text-gradient">STK Cable</span>
          </h1>
          <nav className="topbar-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/customers"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Customers
            </NavLink>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            Welcome, <strong className="welcome-text-glow" style={{ fontSize: '1.5rem', textTransform: 'capitalize', marginLeft: '0.25rem' }}>{user.username} !</strong>
          </span>
          <button className="btn btn-danger" onClick={onLogout} style={{ padding: '0.4rem 1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
