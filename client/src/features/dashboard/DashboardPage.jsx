import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useGetApplicationStatsQuery } from '../applications/applicationsApi';
import { useGetIncidentStatsQuery } from '../incidents/incidentsApi';
import IncidentMap from '../../components/maps/IncidentMap/IncidentMap';

const StatCard = ({ title, value, icon, color, link }) => (
  <Link to={link || '#'} style={{ textDecoration: 'none' }}>
    <div style={{ ...cardStyles.card, borderLeft: `4px solid ${color}` }} className="blaze-card-interactive">
      <div>
        <p style={cardStyles.title}>{title}</p>
        <p style={{ ...cardStyles.value, color }}>{value ?? '—'}</p>
      </div>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
    </div>
  </Link>
);

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { data: appStats } = useGetApplicationStatsQuery(undefined, { skip: !isAdmin });
  const { data: incStats } = useGetIncidentStatsQuery(undefined, { skip: !isAdmin });

  const stats = appStats?.stats || {};
  const incidentStats = incStats?.stats || {};
  const activeIncidents = incidentStats.byStatus?.find((s) => s._id === 'active')?.count || 0;
  const totalApplications = Object.values(stats).reduce((sum, v) => sum + v, 0);
  const pendingApplications = (stats.submitted || 0) + (stats.under_review || 0);
  const approvedApplications = (stats.approved || 0) + (stats.certificate_issued || 0);

  return (
    <div>
      <div style={styles.welcomeBar}>
        <div>
          <h1 style={styles.welcomeTitle}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={styles.welcomeSub}>Here&apos;s what&apos;s happening in BLAZE today</p>
        </div>
        <div style={styles.roleBadge}>{user?.role?.toUpperCase()}</div>
      </div>

      {isAdmin && (
        <div style={styles.statsGrid}>
          <StatCard
            title="Total Applications"
            value={totalApplications}
            icon="📋"
            color="#2980b9"
            link="/applications"
          />
          <StatCard
            title="Pending Review"
            value={pendingApplications}
            icon="⏳"
            color="#f39c12"
            link="/applications?status=submitted"
          />
          <StatCard
            title="Approved / Certified"
            value={approvedApplications}
            icon="✅"
            color="#27ae60"
            link="/noc"
          />
          <StatCard
            title="Active Incidents"
            value={activeIncidents}
            icon="🚨"
            color="#c0392b"
            link="/incidents"
          />
        </div>
      )}

      <div style={styles.mapSection}>
        <h2 style={styles.sectionTitle}>🗺️ Live Incident Map</h2>
        <div style={styles.mapContainer}>
          <IncidentMap />
        </div>
      </div>

      <div style={styles.quickLinks}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.linkGrid}>
          {[
            { label: '+ New Application', to: '/applications/new', color: '#c0392b' },
            { label: '📋 My Applications', to: '/applications', color: '#2980b9' },
            { label: '🏅 NOC Certificates', to: '/noc', color: '#27ae60' },
            { label: '🚨 Incidents', to: '/incidents', color: '#e67e22' },
          ].map(({ label, to, color }) => (
            <Link key={to} to={to} style={{ ...styles.quickLink, background: color }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  welcomeBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  welcomeTitle: { fontSize: '1.75rem', color: '#2c3e50', margin: 0 },
  welcomeSub: { color: '#7f8c8d', margin: '4px 0 0' },
  roleBadge: {
    background: '#c0392b',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  sectionTitle: { fontSize: '1.2rem', color: '#2c3e50', marginBottom: '16px' },
  mapSection: { marginBottom: '28px' },
  mapContainer: { height: '420px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  quickLinks: {},
  linkGrid: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  quickLink: {
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
  },
};

const cardStyles = {
  card: {
    background: '#fff',
    borderRadius: '10px',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  title: { color: '#7f8c8d', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  value: { fontSize: '2rem', fontWeight: '700', margin: 0 },
};

export default DashboardPage;
