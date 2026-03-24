import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetInspectionsQuery } from './inspectionsApi';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import useGeolocation from '../../hooks/useGeolocation';
import { useCheckInMutation } from './inspectionsApi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const InspectionList = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetInspectionsQuery({ page, limit: 15 });
  const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
  const { location } = useGeolocation();

  const handleCheckIn = async (inspectionId) => {
    if (!location) {
      toast.warn('Waiting for GPS location...');
      return;
    }
    try {
      await checkIn({ id: inspectionId, lat: location.lat, lng: location.lng }).unwrap();
      toast.success('GPS check-in successful');
    } catch (err) {
      toast.error(err?.data?.message || 'Check-in failed');
    }
  };

  if (isLoading) return <div style={styles.loading}>Loading inspections...</div>;
  if (isError) return <div style={styles.error}>Failed to load inspections.</div>;

  const { inspections = [], total = 0, pages = 1 } = data || {};

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>🔍 Inspections</h1>
        {location && (
          <span style={styles.gpsIndicator}>
            📍 GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </span>
        )}
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {['Application', 'Property', 'Inspector', 'Scheduled Date', 'Status', 'Result', 'Action'].map(
                (h) => <th key={h} style={styles.th}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {inspections.length === 0 ? (
              <tr><td colSpan={7} style={styles.empty}>No inspections found</td></tr>
            ) : (
              inspections.map((ins) => (
                <tr key={ins._id} style={styles.row}>
                  <td style={styles.td}>
                    <span style={styles.mono}>{ins.application?.applicationNumber || '—'}</span>
                  </td>
                  <td style={styles.td}>{ins.application?.propertyName || '—'}</td>
                  <td style={styles.td}>{ins.inspector?.name || '—'}</td>
                  <td style={styles.td}>
                    {ins.scheduledDate ? format(new Date(ins.scheduledDate), 'dd MMM yyyy') : '—'}
                  </td>
                  <td style={styles.td}><StatusBadge status={ins.status} /></td>
                  <td style={styles.td}>
                    {ins.overallResult ? (
                      <span style={{
                        ...styles.resultBadge,
                        background: ins.overallResult === 'pass' ? '#d4edda' : '#f8d7da',
                        color: ins.overallResult === 'pass' ? '#155724' : '#721c24',
                      }}>
                        {ins.overallResult.replace('_', ' ').toUpperCase()}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link to={`/inspections/${ins._id}`} style={styles.viewBtn}>View</Link>
                      {ins.status === 'scheduled' && (
                        <button
                          onClick={() => handleCheckIn(ins._id)}
                          disabled={isCheckingIn || !location}
                          style={styles.checkInBtn}
                          title={!location ? 'Waiting for GPS...' : 'GPS Check-in'}
                        >
                          📍 Check-in
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.pagination}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}>← Prev</button>
        <span style={styles.pageInfo}>Page {page} of {pages} ({total} total)</span>
        <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} style={styles.pageBtn}>Next →</button>
      </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '1.6rem', color: '#2c3e50' },
  gpsIndicator: { background: '#d4edda', color: '#155724', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  tableWrapper: { background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8f9fa' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' },
  row: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '0.9rem', color: '#2c3e50' },
  mono: { fontFamily: 'monospace', fontSize: '0.8rem' },
  resultBadge: { padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' },
  viewBtn: { color: '#2980b9', fontWeight: '600', fontSize: '0.875rem' },
  checkInBtn: { background: '#27ae60', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' },
  empty: { padding: '40px', textAlign: 'center', color: '#aaa' },
  pagination: { display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', justifyContent: 'flex-end' },
  pageBtn: { padding: '8px 16px', border: '1px solid #dee2e6', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: '600' },
  pageInfo: { color: '#6c757d', fontSize: '0.9rem' },
  loading: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
  error: { padding: '40px', textAlign: 'center', color: '#c0392b' },
};

export default InspectionList;
