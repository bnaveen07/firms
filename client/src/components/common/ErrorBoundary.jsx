import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to an error monitoring service (e.g. Sentry) in production
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>💥</div>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              An unexpected error occurred. Our team has been notified.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre style={styles.details}>
                {this.state.error.toString()}
              </pre>
            )}
            <button onClick={this.handleReset} style={styles.button}>
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    borderTop: '4px solid #c0392b',
  },
  icon: { fontSize: '3rem', marginBottom: '16px' },
  title: { fontSize: '1.5rem', color: '#2c3e50', marginBottom: '12px' },
  message: { color: '#6c757d', marginBottom: '20px' },
  details: {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '0.8rem',
    textAlign: 'left',
    overflowX: 'auto',
    marginBottom: '20px',
    color: '#c0392b',
  },
  button: {
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default ErrorBoundary;
