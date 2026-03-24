import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetIncidentQuery, useAddIncidentUpdateMutation } from './incidentsApi';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const SEVERITY_COLORS = {
  critical: '#c0392b',
  high: '#e67e22',
  medium: '#f39c12',
  low: '#27ae60',
};

const IncidentDetail = () => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetIncidentQuery(id);
  const [addUpdate, { isLoading: isAdding }] = useAddIncidentUpdateMutation();
  const [updateMsg, setUpdateMsg] = useState('');

  if (isLoading) return <div style={styles.loading}>Loading incident...</div>;
  if (isError) return <div style={styles.error}>Failed to load incident.</div>;

  const incident = data?.incident;
  if (!incident) return null;

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateMsg.trim()) return;
    try {
      await addUpdate({ id, message: updateMsg }).unwrap();
      toast.success('Update added');
      setUpdateMsg('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add update');
    }
  };

  return (
    <div>
      <div style={styles.breadcrumb}>
        <Link to="/incidents" style={styles.link}>Incidents</Link> &rsaquo; {incident.incidentNumber}
      </div>

      <div style={styles.header}>
        <div>
          <div style={styles.headerTop}>
            <h1 style={styles.title}>{incident.title}</h1>
            <span style={{ ...styles.sevBadge, background: SEVERITY_COLORS[incident.severity] || '#888' }}>
              {incident.severity?.toUpperCase()}
            </span>
          </div>
          <span style={styles.incNum}>{incident.incidentNumber}</span>
        </div>
        <StatusBadge status={incident.status} size="large" />
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Incident Details</h3>
          <Row label="Type" value={incident.type?.replace('_', ' ')} />
          <Row label="Severity" value={incident.severity?.toUpperCase()} />
          <Row label="Status" value={incident.status} />
          <Row label="Reported By" value={incident.reportedBy?.name} />
          <Row label="Reported On" value={incident.createdAt ? format(new Date(incident.createdAt), 'dd MMM yyyy HH:mm') : '—'} />
          {incident.resolvedAt && <Row label="Resolved On" value={format(new Date(incident.resolvedAt), 'dd MMM yyyy HH:mm')} />}
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Location</h3>
          <Row label="Address" value={incident.location?.address} />
          <Row label="City" value={incident.location?.city} />
          <Row label="State" value={incident.location?.state} />
          <Row label="Latitude" value={incident.location?.coordinates?.lat} />
          <Row label="Longitude" value={incident.location?.coordinates?.lng} />
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Impact</h3>
          <Row label="Injuries" value={incident.casualties?.injuries ?? 0} />
          <Row label="Fatalities" value={incident.casualties?.fatalities ?? 0} />
          <Row label="Property Damage" value={incident.propertyDamage || '—'} />
          <Row label="Cause" value={incident.causeOfFire || '—'} />
          <Row label="Resources Deployed" value={incident.resourcesDeployed || '—'} />
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Description</h3>
        <p style={styles.description}>{incident.description}</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Live Updates ({incident.updates?.length || 0})</h3>
        <form onSubmit={handleAddUpdate} style={styles.updateForm}>
          <input
            value={updateMsg}
            onChange={(e) => setUpdateMsg(e.target.value)}
            placeholder="Add a status update..."
            style={styles.updateInput}
          />
          <button type="submit" disabled={isAdding || !updateMsg.trim()} style={styles.updateBtn}>
            {isAdding ? 'Posting...' : 'Post Update'}
          </button>
        </form>
        <div style={styles.updateFeed}>
          {(incident.updates || []).slice().reverse().map((upd, i) => (
            <div key={i} style={styles.updateItem}>
              <div style={styles.updateDot} />
              <div style={styles.updateContent}>
                <p style={styles.updateMsg}>{upd.message}</p>
                <span style={styles.updateMeta}>
                  {upd.timestamp ? format(new Date(upd.timestamp), 'dd MMM yyyy HH:mm') : ''}
                </span>
              </div>
            </div>
          ))}
          {(!incident.updates || incident.updates.length === 0) && (
            <p style={styles.noUpdates}>No updates yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
    <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>{label}</span>
    <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#2c3e50', textTransform: 'capitalize' }}>{value ?? '—'}</span>
  </div>
);

const styles = {
  breadcrumb: { marginBottom: '16px', color: '#6c757d', fontSize: '0.9rem' },
  link: { color: '#2980b9' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  headerTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' },
  title: { fontSize: '1.6rem', color: '#2c3e50', margin: 0 },
  sevBadge: { color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' },
  incNum: { fontFamily: 'monospace', color: '#7f8c8d', fontSize: '0.85rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' },
  card: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px' },
  cardTitle: { color: '#c0392b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #f0f0f0' },
  description: { color: '#495057', lineHeight: '1.7' },
  updateForm: { display: 'flex', gap: '10px', marginBottom: '20px' },
  updateInput: { flex: 1, padding: '10px 14px', border: '1.5px solid #dee2e6', borderRadius: '6px', fontSize: '0.95rem' },
  updateBtn: { padding: '10px 20px', background: '#2980b9', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  updateFeed: { display: 'flex', flexDirection: 'column', gap: '12px' },
  updateItem: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  updateDot: { width: '10px', height: '10px', background: '#c0392b', borderRadius: '50%', marginTop: '5px', flexShrink: 0 },
  updateContent: {},
  updateMsg: { margin: '0 0 4px', color: '#2c3e50' },
  updateMeta: { fontSize: '0.8rem', color: '#aaa' },
  noUpdates: { color: '#aaa', textAlign: 'center', padding: '20px 0' },
  loading: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
  error: { padding: '40px', textAlign: 'center', color: '#c0392b' },
};

export default IncidentDetail;
