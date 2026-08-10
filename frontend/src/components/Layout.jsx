import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export default function Layout({ user, onLogout }) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Auto-logout on idle */
  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      localStorage.setItem('lastActivity', Date.now().toString());
      timeoutId = setTimeout(() => { onLogout(); }, 5 * 60 * 1000);
    };
    window.addEventListener('mousemove',  resetTimer);
    window.addEventListener('keydown',    resetTimer);
    window.addEventListener('click',      resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove',  resetTimer);
      window.removeEventListener('keydown',    resetTimer);
      window.removeEventListener('click',      resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [onLogout]);

  /* Close drawer on route change */
  useEffect(() => { setDrawerOpen(false); }, [location]);

  const pageTitle = location.pathname.includes('customers') ? 'Customer Directory' : 'Dashboard Analytics';

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
            <polyline points="17 2 12 7 7 2"></polyline>
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <span className="text-gradient">STK</span> Cable
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Navigation</div>
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
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <div className="sidebar-user-name" style={{ textTransform: 'capitalize' }}>{user?.username || 'User'}</div>
            <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>{user?.role || 'Admin'}</div>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onLogout} style={{ width: '100%', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <aside className="sidebar sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* ── Mobile: drawer overlay ── */}
      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
      )}
      <aside className={`sidebar sidebar-mobile ${drawerOpen ? 'drawer-open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="main-area">
        <header className="topbar">
          {/* Hamburger (mobile only) */}
          <button
            className="hamburger"
            onClick={() => setDrawerOpen(o => !o)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>

          <h1 className="topbar-title">{pageTitle}</h1>
        </header>

        <main className="page-content">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
