import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './AdminLayout.module.css';

const navItems = [
  { path: '/admin', label: 'Dashboard', exact: true, icon: '📊' },
  { path: '/admin/products', label: 'Products', icon: '🛍️' },
  { path: '/admin/orders', label: 'Orders', icon: '📝' },
  { path: '/admin/categories', label: 'Categories', icon: '📁' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false); // Desktop collapse
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobile drawer toggle
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- THE SCALABILITY FIX: Auto-close sidebar on mobile when navigating ---
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`${styles.layout} ${collapsed ? styles.collapsed : ''}`}>
      
      {/* 1. MOBILE BACKDROP */}
      {isMobileOpen && (
        <div className={styles.backdrop} onClick={() => setIsMobileOpen(false)} />
      )}

      {/* 2. SIDEBAR */}
      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.mobileActive : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/admin" className={styles.sidebarLogo}>
            <div className={styles.logoBadge}>S</div>
            {(!collapsed || isMobileOpen) && <span className={styles.logoLabel}>Siri Admin</span>}
          </Link>
          
          {/* Collapse button - only visible on Desktop */}
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {(!collapsed || isMobileOpen) && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link to="/" className={styles.viewSiteBtn}>
            <span>🏠</span> {(!collapsed || isMobileOpen) && "View Site"}
          </Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>🚪</span> {(!collapsed || isMobileOpen) && "Logout"}
          </button>
        </div>
      </aside>

      {/* 3. MAIN CONTENT */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
             {/* THE TRIGGER: This hamburger icon only appears on mobile */}
             <button className={styles.mobileMenuBtn} onClick={() => setIsMobileOpen(true)}>
                <span /><span /><span />
             </button>
             <h2 className={styles.pageTitle}>Siri Collections Inventory</h2>
          </div>
          
          <div className={styles.topbarRight}>
            <div className={styles.adminInfo}>
              <span className={styles.adminName}>{user?.name || 'Admin'}</span>
              <div className={styles.adminAvatar}>
                {(user?.name || 'A')[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}