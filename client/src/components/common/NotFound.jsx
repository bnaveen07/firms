import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <h2 style={styles.subtitle}>Page Not Found</h2>
      <p style={styles.text}>The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="blaze-btn blaze-btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f4f6f9',
    padding: '20px',
    textAlign: 'center',
  },
  title: { fontSize: '8rem', fontWeight: '900', color: 'var(--primary)', margin: 0, lineHeight: 1 },
  subtitle: { fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '20px 0 10px' },
  text: { color: '#6b7280', maxWidth: '400px', marginBottom: '30px' },
};

export default NotFound;
