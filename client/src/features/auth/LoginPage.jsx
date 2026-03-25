import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from './authSlice';
import { toast } from 'react-toastify';

const PORTALS = {
  admin: {
    key: 'admin',
    icon: '🛡️',
    label: 'Admin Portal',
    sublabel: 'Fire Dept',
    accent: '#c0392b',
    gradient: 'linear-gradient(135deg, #1a0505 0%, #3d0c0c 100%)',
    badgeBg: 'rgba(192,57,43,0.15)',
    badgeColor: '#c0392b',
    placeholder: 'admin@firesafety.gov',
    buttonBg: 'var(--primary)',
    description: 'Manage applications, assign inspectors, issue certificates.',
    capabilities: ['Approve Applications', 'Issue Certificates', 'Monitor Incidents'],
  },
  user: {
    key: 'user',
    icon: '🏢',
    label: 'User Portal',
    sublabel: 'Applicant/Inspector',
    accent: '#1a6db5',
    gradient: 'linear-gradient(135deg, #020d1a 0%, #0c2340 100%)',
    badgeBg: 'rgba(26,109,181,0.12)',
    badgeColor: '#1a6db5',
    placeholder: 'applicant@example.com',
    buttonBg: '#1a6db5',
    description: 'Submit applications, track status, download certificates.',
    capabilities: ['Submit Applications', 'Track Status', 'Download Certificates'],
  },
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [portal, setPortal] = useState('admin');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const p = PORTALS[portal];

  const handlePortalSwitch = (key) => {
    setPortal(key);
    setFormData({ email: '', password: '' });
    dispatch(clearError());
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      toast.success('Login successful');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div style={{ ...styles.page, background: p.gradient }}>
      <div style={styles.wrapper}>
        <div style={styles.leftPanel} className="register-left-panel">
          <div style={styles.brand}>
            <span style={styles.brandIcon}>🔥</span>
            <div>
              <div style={styles.brandName}>BLAZE</div>
              <div style={styles.brandTagline}>Fire Safety Platform</div>
            </div>
          </div>
          <div style={{ ...styles.activePortalBadge, background: p.badgeBg, color: p.badgeColor }}>
            {p.icon} {p.label}
          </div>
          <p style={styles.leftDesc}>{p.description}</p>
          <ul style={styles.capList} className="register-bullets">
            {p.capabilities.map((cap) => (
              <li key={cap} style={styles.capItem}>
                <span style={{ ...styles.capDot, background: p.accent }} />
                {cap}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.card}>
          <div style={styles.portalSwitch}>
            {Object.values(PORTALS).map((pt) => (
              <button
                key={pt.key}
                onClick={() => handlePortalSwitch(pt.key)}
                style={{
                  ...styles.switchBtn,
                  ...(portal === pt.key ? { borderBottomColor: pt.accent, color: pt.accent } : {}),
                }}
              >
                {pt.icon} {pt.key === 'admin' ? 'Admin' : 'User'}
              </button>
            ))}
          </div>

          <h2 style={styles.formTitle}>Sign In</h2>
          {error && <div className="blaze-error-box" style={{ marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="blaze-input"
                placeholder={p.placeholder}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="blaze-input"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="blaze-btn blaze-btn-primary" style={{ background: p.buttonBg }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={styles.registerLink}>
            {portal === 'user' ? (
              <>Don't have an account? <Link to="/register" style={{ color: p.accent, fontWeight: '600' }}>Register here</Link></>
            ) : (
              'Admin access is restricted.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  wrapper: { display: 'flex', width: '100%', maxWidth: '800px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' },
  leftPanel: { flex: '0 0 300px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '40px 30px', display: 'flex', flexDirection: 'column', gap: '20px' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon: { fontSize: '2rem' },
  brandName: { fontSize: '1.4rem', fontWeight: '900', color: '#fff' },
  brandTagline: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
  activePortalBadge: { display: 'inline-flex', padding: '6px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' },
  leftDesc: { color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6 },
  capList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  capItem: { display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' },
  capDot: { width: '6px', height: '6px', borderRadius: '50%' },
  card: { flex: 1, background: '#fff', padding: '40px 30px' },
  portalSwitch: { display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: '25px' },
  switchBtn: { flex: 1, padding: '12px', background: 'none', border: 'none', borderBottom: '2px solid transparent', fontSize: '0.9rem', fontWeight: '600', color: '#999', cursor: 'pointer' },
  formTitle: { fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.8rem', fontWeight: '700', color: '#666' },
  registerLink: { textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '0.85rem' },
};

export default LoginPage;
