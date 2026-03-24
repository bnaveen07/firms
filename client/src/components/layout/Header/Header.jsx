import React from 'react';
import { useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/applications': 'NOC Applications',
  '/applications/new': 'New Application',
  '/inspections': 'Inspections',
  '/incidents': 'Incidents',
  '/noc': 'NOC Certificates',
  '/analytics': 'Analytics',
};

const ROLE_META = {
  admin: { color: '#e55c4a', bg: 'rgba(229,92,74,0.1)', label: 'Administrator' },
  applicant: { color: '#1a6db5', bg: 'rgba(26,109,181,0.1)', label: 'Applicant' },
  inspector: { color: '#16a34a', bg: 'rgba(22,163,74,0.1)', label: 'Inspector' },
};

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const title = PAGE_TITLES[location.pathname] || 'BLAZE';
  const role = user?.role || 'applicant';
  const meta = ROLE_META[role] || ROLE_META.applicant;

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <h2 style={styles.title}>{title}</h2>
        <div style={styles.liveChip}>
          <span style={styles.liveDot} />
          Live
        </div>
      </div>
      <div style={styles.right}>
        <span style={styles.orgName}>
          {user?.organization ? user.organization : user?.name}
        </span>
        <div style={{ ...styles.roleBadge, background: meta.bg, color: meta.color }}>
          {role === 'admin' ? '🛡️' : role === 'inspector' ? '🔍' : '🏢'} {meta.label}
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: '60px',
    background: '#fff',
    borderBottom: '1px solid #eef0f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  title: { fontSize: '1rem', color: '#111827', margin: 0, fontWeight: '700', letterSpacing: '0.1px' },
  liveChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(22,163,74,0.08)',
    color: '#16a34a',
    border: '1px solid rgba(22,163,74,0.2)',
    fontSize: '0.65rem',
    fontWeight: '700',
    letterSpacing: '0.8px',
    padding: '2px 7px',
    borderRadius: '999px',
  },
  liveDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#16a34a',
    display: 'inline-block',
    boxShadow: '0 0 0 2px rgba(22,163,74,0.25)',
  },
  right: { display: 'flex', alignItems: 'center', gap: '10px' },
  orgName: { color: '#6b7280', fontSize: '0.85rem', fontWeight: '500' },
  roleBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.1px',
  },
};

export default Header;
