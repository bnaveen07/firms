import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard', roles: ['admin', 'applicant', 'inspector'] },
  { to: '/applications', icon: '📋', label: 'Applications', roles: ['admin', 'applicant'] },
  { to: '/inspections', icon: '🔍', label: 'Inspections', roles: ['admin', 'inspector'] },
  { to: '/incidents', icon: '🚨', label: 'Incidents', roles: ['admin', 'inspector', 'applicant'] },
  { to: '/noc', icon: '🏅', label: 'NOC Certificates', roles: ['admin', 'applicant'] },
  { to: '/analytics', icon: '📊', label: 'Analytics', roles: ['admin'] },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🔥</span>
        <div>
          <div style={styles.logoText}>BLAZE</div>
          <div style={styles.logoSub}>Fire Safety Platform</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {visibleItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}
          >
            <span style={styles.navIcon}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    background: '#1a1a2e',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflowY: 'auto',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoIcon: { fontSize: '2rem' },
  logoText: { fontSize: '1.3rem', fontWeight: '800', color: '#fff', letterSpacing: '1px' },
  logoSub: { fontSize: '0.7rem', color: '#c0392b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  nav: { flex: 1, padding: '16px 0' },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    color: 'rgba(255,255,255,0.65)',
    fontSize: '0.9rem',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.2s',
    borderLeft: '3px solid transparent',
  },
  navLinkActive: {
    color: '#fff',
    background: 'rgba(192,57,43,0.15)',
    borderLeft: '3px solid #c0392b',
  },
  navIcon: { fontSize: '1.1rem', width: '22px', textAlign: 'center' },
  userSection: { padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  userAvatar: {
    width: '36px',
    height: '36px',
    background: '#c0392b',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: '1rem',
  },
  userName: { color: '#fff', fontWeight: '600', fontSize: '0.9rem' },
  userRole: { color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'capitalize' },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    background: 'rgba(192,57,43,0.2)',
    color: '#e74c3c',
    border: '1px solid rgba(192,57,43,0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
};

export default Sidebar;
