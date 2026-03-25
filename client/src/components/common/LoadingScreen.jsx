import React from 'react';

const LoadingScreen = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.fireWrapper}>
          <div style={styles.fire}>
            <div style={styles.fireLeft}>
              <div style={styles.mainFire}></div>
            </div>
            <div style={styles.fireMain}>
              <div style={styles.mainFire}></div>
            </div>
            <div style={styles.fireRight}>
              <div style={styles.mainFire}></div>
            </div>
            <div style={styles.fireBottom}>
              <div style={styles.mainFire}></div>
            </div>
          </div>
        </div>
        <h2 style={styles.title}>BLAZE</h2>
        <p style={styles.subtitle}>Initialising Fire Safety Systems...</p>
      </div>
      <style>{`
        @keyframes fire-animation {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .fire-part {
          animation: fire-animation 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d0d1a',
    color: '#fff',
    fontFamily: 'system-ui, sans-serif',
  },
  content: { textAlign: 'center' },
  fireWrapper: {
    fontSize: '3rem',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    letterSpacing: '2px',
    margin: '0 0 10px',
    color: '#fff',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)',
    margin: 0,
    letterSpacing: '0.5px',
  },
  /* Simplified CSS fire icon replacement for Emoji */
  fire: {
    width: '60px',
    height: '60px',
    background: 'radial-gradient(circle at bottom, #ff5f00 20%, #ff0000 100%)',
    borderRadius: '50% 50% 20% 50%',
    transform: 'rotate(-45deg)',
    boxShadow: '0 0 20px #ff5f00',
    position: 'relative',
  }
};

export default LoadingScreen;
