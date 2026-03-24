import React from 'react';
import { useGetCertificatesQuery } from './nocApi';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const NOCViewer = () => {
  const { data, isLoading, isError } = useGetCertificatesQuery({});

  if (isLoading) return <div style={styles.loading}>Loading certificates...</div>;
  if (isError) return <div style={styles.error}>Failed to load certificates.</div>;

  const { certificates = [] } = data || {};

  return (
    <div>
      <h1 style={styles.title}>🏅 NOC Certificates</h1>
      {certificates.length === 0 ? (
        <div style={styles.empty}>No certificates found</div>
      ) : (
        <div style={styles.grid}>
          {certificates.map((cert) => (
            <div key={cert._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.certNum}>{cert.certificateNumber}</span>
                <StatusBadge status={cert.status} />
              </div>
              <h3 style={styles.propName}>{cert.propertyDetails?.name}</h3>
              <p style={styles.propAddr}>{cert.propertyDetails?.address}</p>
              <div style={styles.dates}>
                <div>
                  <span style={styles.dateLabel}>Valid From</span>
                  <span style={styles.dateVal}>{format(new Date(cert.validFrom), 'dd MMM yyyy')}</span>
                </div>
                <div>
                  <span style={styles.dateLabel}>Valid Until</span>
                  <span style={styles.dateVal}>{format(new Date(cert.validUntil), 'dd MMM yyyy')}</span>
                </div>
              </div>
              <div style={styles.cardFooter}>
                <Link to={`/noc/${cert._id}`} style={styles.viewBtn}>View Details</Link>
                {cert.pdfUrl && (
                  <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" style={styles.pdfBtn}>
                    📄 Download PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  title: { fontSize: '1.6rem', color: '#2c3e50', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
  card: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: '4px solid #27ae60' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  certNum: { fontFamily: 'monospace', fontSize: '0.85rem', color: '#6c757d', fontWeight: '600' },
  propName: { fontSize: '1.1rem', color: '#2c3e50', marginBottom: '4px' },
  propAddr: { color: '#7f8c8d', fontSize: '0.875rem', marginBottom: '16px' },
  dates: { display: 'flex', justifyContent: 'space-between', background: '#f8f9fa', borderRadius: '6px', padding: '12px', marginBottom: '16px' },
  dateLabel: { display: 'block', fontSize: '0.75rem', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' },
  dateVal: { display: 'block', fontWeight: '600', color: '#2c3e50', fontSize: '0.9rem', marginTop: '2px' },
  cardFooter: { display: 'flex', gap: '10px' },
  viewBtn: { padding: '8px 16px', background: '#2980b9', color: '#fff', borderRadius: '6px', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' },
  pdfBtn: { padding: '8px 16px', background: '#27ae60', color: '#fff', borderRadius: '6px', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' },
  loading: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
  error: { padding: '40px', textAlign: 'center', color: '#c0392b' },
  empty: { padding: '60px', textAlign: 'center', color: '#aaa', background: '#fff', borderRadius: '10px' },
};

export default NOCViewer;
