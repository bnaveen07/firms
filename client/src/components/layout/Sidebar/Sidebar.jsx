import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⬛', emoji: '🏠', label: 'Dashboard', roles: ['admin', 'applicant', 'inspector'] },
  { to: '/applications', icon: '⬛', emoji: '📋', label: 'Applications', roles: ['admin', 'applicant'] },
  { to: '/inspections', icon: '⬛', emoji: '🔍', label: 'Inspections', roles: ['admin', 'inspector'] },
  { to: '/incidents', icon: '⬛', emoji: '🚨', label: 'Incidents', roles: ['admin', 'inspector', 'applicant'] },
  { to: '/noc', icon: '⬛', emoji: '🏅', label: 'NOC Certificates', roles: ['admin', 'applicant'] },
  { to: '/analytics', icon: '⬛', emoji: '📊', label: 'Analytics', roles: ['admin'] },
];

const ROLE_META = {
  admin: { label: 'Administrator', color: '#e55c4a', bg: 'rgba(229,92,74,0.15)', border: 'rgba(229,92,74,0.3)' },
  applicant: { label: 'Applicant', color: '#4da3e8', bg: 'rgba(77,163,232,0.15)', border: 'rgba(77,163,232,0.3)' },
  inspector: { label: 'Inspector', color: '#2ecc82', bg: 'rgba(46,204,130,0.15)', border: 'rgba(46,204,130,0.3)' },
};

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'applicant';
  const meta = ROLE_META[role] || ROLE_META.applicant;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const sidebarClass = `sidebar-container ${isMobile ? (isOpen ? 'sidebar-open' : 'sidebar-hidden') : ''}`;

  return (
    <aside style={styles.sidebar} className={sidebarClass}>
      {/* Brand */}
      <div style={styles.brand}>
        <div style={styles.brandIconWrap}>
          <span style={styles.brandIcon}>🔥</span>
        </div>
        <div>
          <div style={styles.brandName}>BLAZE</div>
          <div style={styles.brandSub}>NOC Management</div>
        </div>
        {isMobile && (
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        )}
      </div>

      {/* Role badge */}
      <div style={styles.roleArea}>
        <div style={{ ...styles.roleBadge, background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
          {role === 'admin' ? '🛡️' : role === 'inspector' ? '🔍' : '🏢'} {meta.label}
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>NAVIGATION</div>
        {visibleItems.map(({ to, emoji, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={isMobile ? onClose : undefined}
            style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? { ...styles.navLinkActive, borderLeft: `3px solid ${meta.color}` } : {}) })}
          >
            <span style={styles.navIcon}>{emoji}</span>
            <span style={styles.navText}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={styles.userSection}>
        <div style={styles.userCard}>
          <div style={{ ...styles.userAvatar, background: meta.bg, color: meta.color, border: `1.5px solid ${meta.border}` }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userOrg}>{user?.organization || user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          ↩ Sign Out
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '256px',
    height: '100vh',
    background: 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflowY: 'auto',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    transition: 'transform 0.3s ease-in-out',
  },

  /* Brand */
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 18px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  brandIconWrap: {
    width: '36px',
    height: '36px',
    background: 'rgba(229,92,74,0.15)',
    border: '1px solid rgba(229,92,74,0.3)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    flexShrink: 0,
  },
  brandIcon: { lineHeight: 1 },
  brandName: { fontSize: '1rem', fontWeight: '800', color: '#fff', letterSpacing: '0.5px' },
  brandSub: { fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '1px' },
  closeBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '4px',
  },

  /* Role area */
  roleArea: { padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontWeight: '700',
    letterSpacing: '0.2px',
  },

  /* Nav */
  nav: { flex: 1, padding: '16px 10px 8px' },
  navLabel: {
    fontSize: '0.62rem',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: '1px',
    padding: '0 10px',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 10px',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.875rem',
    fontWeight: '500',
    textDecoration: 'none',
    borderRadius: '8px',
    marginBottom: '2px',
    borderLeft: '3px solid transparent',
    transition: 'all 0.15s',
  },
  navLinkActive: {
    color: '#fff',
    background: 'rgba(255,255,255,0.06)',
    fontWeight: '600',
  },
  navIcon: { fontSize: '1rem', width: '20px', textAlign: 'center', flexShrink: 0 },
  navText: { flex: 1 },

  /* User section */
  userSection: {
    padding: '14px 18px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userCard: { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  userInfo: { overflow: 'hidden' },
  userName: { color: '#fff', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userOrg: { color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.8rem',
    letterSpacing: '0.2px',
    transition: 'all 0.2s',
  },
};

export default Sidebar;
