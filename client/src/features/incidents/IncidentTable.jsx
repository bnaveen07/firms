import React, { useState, useEffect } from 'react';
import { useGetIncidentsQuery } from './incidentsApi';
import { useCreateIncidentMutation } from './incidentsApi';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const SEVERITY_COLORS = { critical: '#c0392b', high: '#e67e22', medium: '#f39c12', low: '#27ae60' };

const IncidentTable = () => {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, refetch } = useGetIncidentsQuery({ page, limit: 15 });
  const [createIncident, { isLoading: isCreating }] = useCreateIncidentMutation();
  const { on, off } = useSocket();

  const [newIncident, setNewIncident] = useState({
    title: '', description: '', type: 'fire', severity: 'medium',
    location: { address: '', city: '', state: '', coordinates: { lat: '', lng: '' } },
  });

  useEffect(() => {
    const handler = () => refetch();
    on('incident:new', handler);
    return () => off('incident:new', handler);
  }, [on, off, refetch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createIncident({
        ...newIncident,
        location: {
          ...newIncident.location,
          coordinates: {
            lat: parseFloat(newIncident.location.coordinates.lat),
            lng: parseFloat(newIncident.location.coordinates.lng),
          },
        },
      }).unwrap();
      toast.success('Incident reported');
      setShowForm(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create incident');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.coordinates.')) {
      const field = name.split('.').pop();
      setNewIncident((prev) => ({
        ...prev,
        location: { ...prev.location, coordinates: { ...prev.location.coordinates, [field]: value } },
      }));
    } else if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setNewIncident((prev) => ({ ...prev, location: { ...prev.location, [field]: value } }));
    } else {
      setNewIncident((prev) => ({ ...prev, [name]: value }));
    }
  };

  const { incidents = [], total = 0, pages = 1 } = data || {};

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>🚨 Incidents</h1>
        <button onClick={() => setShowForm(!showForm)} style={styles.newBtn}>
          {showForm ? 'Cancel' : '+ Report Incident'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Report New Incident</h3>
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.grid2}>
              <div style={styles.field}>
                <label style={styles.label}>Title *</label>
                <input name="title" value={newIncident.title} onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Type *</label>
                <select name="type" value={newIncident.type} onChange={handleChange} style={styles.input}>
                  {['fire', 'explosion', 'chemical_leak', 'structural', 'other'].map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Severity *</label>
                <select name="severity" value={newIncident.severity} onChange={handleChange} style={styles.input}>
                  {['low', 'medium', 'high', 'critical'].map((s) => (
                    <option key={s} value={s}>{s.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>City</label>
                <input name="location.city" value={newIncident.location.city} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Latitude *</label>
                <input type="number" step="any" name="location.coordinates.lat" value={newIncident.location.coordinates.lat} onChange={handleChange} style={styles.input} required placeholder="19.0760" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Longitude *</label>
                <input type="number" step="any" name="location.coordinates.lng" value={newIncident.location.coordinates.lng} onChange={handleChange} style={styles.input} required placeholder="72.8777" />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description *</label>
              <textarea name="description" value={newIncident.description} onChange={handleChange} style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" disabled={isCreating} style={styles.submitBtn}>
                {isCreating ? 'Reporting...' : 'Report Incident'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div style={styles.loading}>Loading incidents...</div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                {['#', 'Title', 'Type', 'Severity', 'Location', 'Status', 'Reported', 'Action'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr><td colSpan={8} style={styles.empty}>No incidents found</td></tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc._id} style={styles.row}>
                    <td style={styles.td}><span style={styles.mono}>{inc.incidentNumber}</span></td>
                    <td style={styles.td}>{inc.title}</td>
                    <td style={styles.td}>{inc.type}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.sevBadge, background: SEVERITY_COLORS[inc.severity] }}>
                        {inc.severity?.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>{inc.location?.city || '—'}</td>
                    <td style={styles.td}><StatusBadge status={inc.status} /></td>
                    <td style={styles.td}>{format(new Date(inc.createdAt), 'dd MMM yyyy')}</td>
                    <td style={styles.td}>
                      <a href={`/incidents/${inc._id}`} style={styles.viewBtn}>View</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.pagination}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}>← Prev</button>
        <span style={styles.pageInfo}>Page {page} of {pages} ({total} total)</span>
        <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} style={styles.pageBtn}>Next →</button>
      </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '1.6rem', color: '#2c3e50' },
  newBtn: { background: '#c0392b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  formCard: { background: '#fff', borderRadius: '10px', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  formTitle: { color: '#c0392b', marginBottom: '16px' },
  form: {},
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#495057' },
  input: { padding: '9px 12px', border: '1.5px solid #dee2e6', borderRadius: '6px', fontSize: '0.95rem' },
  cancelBtn: { padding: '9px 18px', border: '1px solid #dee2e6', borderRadius: '6px', background: '#fff', cursor: 'pointer', color: '#6c757d', fontWeight: '600' },
  submitBtn: { padding: '9px 20px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  tableWrapper: { background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8f9fa' },
  th: { padding: '12px 14px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' },
  row: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 14px', fontSize: '0.9rem', color: '#2c3e50' },
  mono: { fontFamily: 'monospace', fontSize: '0.8rem' },
  sevBadge: { color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' },
  viewBtn: { color: '#2980b9', fontWeight: '600' },
  empty: { padding: '40px', textAlign: 'center', color: '#aaa' },
  pagination: { display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', justifyContent: 'flex-end' },
  pageBtn: { padding: '8px 16px', border: '1px solid #dee2e6', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: '600' },
  pageInfo: { color: '#6c757d', fontSize: '0.9rem' },
  loading: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
};

export default IncidentTable;
