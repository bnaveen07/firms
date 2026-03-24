import React from 'react';
import { useParams } from 'react-router-dom';
import { useVerifyCertificateQuery } from './nocApi';
import { format } from 'date-fns';

const VerifyNOC = () => {
  const { token } = useParams();
  const { data, isLoading, isError } = useVerifyCertificateQuery(token, { skip: !token });

  if (!token) return <div style={styles.container}><div style={styles.card}><p>Invalid verification link.</p></div></div>;
  if (isLoading) return <div style={styles.container}><div style={styles.card}><p>Verifying certificate...</p></div></div>;
  if (isError) return (
    <div style={styles.container}>
      <div style={{ ...styles.card, borderTop: '4px solid #c0392b' }}>
        <div style={styles.icon}>❌</div>
        <h2 style={{ color: '#c0392b' }}>Certificate Not Found</h2>
        <p>This certificate could not be verified. It may be invalid or revoked.</p>
      </div>
    </div>
  );

  const { isValid, certificate } = data || {};

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, borderTop: `4px solid ${isValid ? '#27ae60' : '#c0392b'}` }}>
        <div style={styles.icon}>{isValid ? '✅' : '⚠️'}</div>
        <h1 style={{ color: '#2c3e50', marginBottom: '8px' }}>🔥 FRIMS NOC Verification</h1>
        <h2 style={{ color: isValid ? '#27ae60' : '#c0392b', marginBottom: '24px' }}>
          {isValid ? 'Certificate is VALID' : 'Certificate is INVALID / EXPIRED'}
        </h2>

        {certificate && (
          <div style={styles.details}>
            <Row label="Certificate Number" value={certificate.certificateNumber} />
            <Row label="Property Name" value={certificate.propertyDetails?.name} />
            <Row label="Property Address" value={certificate.propertyDetails?.address} />
            <Row label="Property Type" value={certificate.propertyDetails?.type} />
            <Row label="Valid From" value={certificate.validFrom ? format(new Date(certificate.validFrom), 'dd MMMM yyyy') : '—'} />
            <Row label="Valid Until" value={certificate.validUntil ? format(new Date(certificate.validUntil), 'dd MMMM yyyy') : '—'} />
            <Row label="Status" value={certificate.status?.toUpperCase()} highlight={isValid} />
            <Row label="Issued On" value={certificate.issuedAt ? format(new Date(certificate.issuedAt), 'dd MMMM yyyy') : '—'} />
          </div>
        )}

        <p style={styles.footer}>
          Verified by Fire Risk Incident Management System (FRIMS)
        </p>
      </div>
    </div>
  );
};

const Row = ({ label, value, highlight }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>{label}</span>
    <span style={{ fontWeight: '700', color: highlight ? '#27ae60' : '#2c3e50', fontSize: '0.9rem' }}>{value || '—'}</span>
  </div>
);

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '560px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  icon: { fontSize: '3rem', marginBottom: '12px' },
  details: { textAlign: 'left', margin: '20px 0' },
  footer: { color: '#aaa', fontSize: '0.8rem', marginTop: '20px' },
};

export default VerifyNOC;
