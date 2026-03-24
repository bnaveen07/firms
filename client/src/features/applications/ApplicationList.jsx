import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGetApplicationsQuery } from './applicationsApi';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import { format } from 'date-fns';

const ApplicationList = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const statusFilter = searchParams.get('status') || '';

  const { data, isLoading, isError } = useGetApplicationsQuery({
    page,
    limit: 15,
    ...(statusFilter && { status: statusFilter }),
  });

  if (isLoading) return <div style={styles.loading}>Loading applications...</div>;
  if (isError) return <div style={styles.error}>Failed to load applications.</div>;

  const { applications = [], total = 0, pages = 1 } = data || {};

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>📋 NOC Applications</h1>
        <Link to="/applications/new" style={styles.newBtn}>+ New Application</Link>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {['Application #', 'Property Name', 'Type', 'Applicant', 'Status', 'Submitted', 'Action'].map(
                (h) => (
                  <th key={h} style={styles.th}>{h}</th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={7} style={styles.empty}>No applications found</td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id} style={styles.row}>
                  <td style={styles.td}>{app.applicationNumber}</td>
                  <td style={styles.td}>{app.propertyName}</td>
                  <td style={styles.td}>{app.propertyType}</td>
                  <td style={styles.td}>{app.applicant?.name || '—'}</td>
                  <td style={styles.td}><StatusBadge status={app.status} /></td>
                  <td style={styles.td}>
                    {app.submittedAt ? format(new Date(app.submittedAt), 'dd MMM yyyy') : '—'}
                  </td>
                  <td style={styles.td}>
                    <Link to={`/applications/${app._id}`} style={styles.viewBtn}>View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.pagination}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}>
          ← Prev
        </button>
        <span style={styles.pageInfo}>Page {page} of {pages} ({total} total)</span>
        <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} style={styles.pageBtn}>
          Next →
        </button>
      </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '1.6rem', color: '#2c3e50' },
  newBtn: { background: '#c0392b', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', textDecoration: 'none' },
  tableWrapper: { background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8f9fa' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '700', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' },
  row: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: '0.9rem', color: '#2c3e50' },
  empty: { padding: '40px', textAlign: 'center', color: '#aaa' },
  viewBtn: { color: '#2980b9', fontWeight: '600' },
  pagination: { display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px', justifyContent: 'flex-end' },
  pageBtn: { padding: '8px 16px', border: '1px solid #dee2e6', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: '600' },
  pageInfo: { color: '#6c757d', fontSize: '0.9rem' },
  loading: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
  error: { padding: '40px', textAlign: 'center', color: '#c0392b' },
};

export default ApplicationList;
