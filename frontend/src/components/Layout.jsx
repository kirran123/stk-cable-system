import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export default function Layout({ user, onLogout }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      localStorage.setItem('lastActivity', Date.now().toString());
      timeoutId = setTimeout(() => {
        onLogout();
      }, 5 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [onLogout]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const pageTitle = location.pathname.includes('customers') ? 'Customer Management' : 'Dashboard Overview';

  return (
    <div className="app-shell">
      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90, backdropFilter: 'blur(4px)' }} 
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
              <polyline points="17 2 12 7 7 2"></polyline>
            </svg>
          </div>
          <div className="sidebar-logo-text">
            <span className="text-gradient">STK</span> Cable
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Main Menu</div>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            <span>Customers</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.username || 'User'}</div>
              <div className="sidebar-user-role">{user?.role || 'Admin'}</div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onLogout} style={{ width: '100%', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="btn btn-ghost btn-icon" 
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: 'none' }} // styled via media query
              id="mobile-menu-btn"
            >
              ☰
            </button>
            <h1 className="topbar-title">{pageTitle}</h1>
          </div>

          <div className="topbar-right">
            <span className="tag">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: 4 }}></span>
              Convex Live
            </span>
          </div>
        </header>

        <main className="page-content">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
