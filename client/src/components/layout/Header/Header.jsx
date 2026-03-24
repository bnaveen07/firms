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

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const title = PAGE_TITLES[location.pathname] || 'BLAZE';

  return (
    <header style={styles.header}>
      <h2 style={styles.title}>{title}</h2>
      <div style={styles.right}>
        <span style={styles.greeting}>
          {user?.organization ? `${user.organization}` : user?.name}
        </span>
        <div style={styles.badge}>{user?.role}</div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: '64px',
    background: '#fff',
    borderBottom: '1px solid #dee2e6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  title: { fontSize: '1.1rem', color: '#2c3e50', margin: 0, fontWeight: '700' },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  greeting: { color: '#6c757d', fontSize: '0.9rem' },
  badge: {
    background: '#1a1a2e',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
};

export default Header;
