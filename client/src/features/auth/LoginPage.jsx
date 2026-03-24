import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from './authSlice';
import { toast } from 'react-toastify';

/* ── Portal definitions ─────────────────────────────────────────────────── */
const PORTALS = {
  admin: {
    key: 'admin',
    icon: '🛡️',
    label: 'Admin Portal',
    sublabel: 'Fire Department & Authorities',
    accent: '#c0392b',
    accentLight: '#fdf3f3',
    accentBorder: 'rgba(192,57,43,0.25)',
    gradient: 'linear-gradient(135deg, #1a0505 0%, #3d0c0c 50%, #6b1414 100%)',
    badgeBg: 'rgba(192,57,43,0.15)',
    badgeBorder: 'rgba(192,57,43,0.35)',
    badgeColor: '#c0392b',
    placeholder: 'admin@firesafety.gov',
    buttonBg: 'linear-gradient(135deg, #c0392b, #e74c3c)',
    buttonShadow: '0 4px 18px rgba(192,57,43,0.45)',
    description: 'Manage NOC applications, assign inspectors, issue certificates, and monitor live incidents.',
    warning: '⚠️ Restricted to authorised fire department personnel only.',
    warningBg: 'rgba(192,57,43,0.08)',
    warningColor: '#c0392b',
    capabilities: ['Approve / reject NOC applications', 'Issue QR-verified certificates', 'Monitor live fire incidents', 'View analytics & heatmaps'],
  },
  user: {
    key: 'user',
    icon: '🏢',
    label: 'User Portal',
    sublabel: 'Applicant & Inspector Access',
    accent: '#1a6db5',
    accentLight: '#eef5fd',
    accentBorder: 'rgba(26,109,181,0.25)',
    gradient: 'linear-gradient(135deg, #020d1a 0%, #0c2340 50%, #143d6b 100%)',
    badgeBg: 'rgba(26,109,181,0.12)',
    badgeBorder: 'rgba(26,109,181,0.3)',
    badgeColor: '#1a6db5',
    placeholder: 'applicant@example.com',
    buttonBg: 'linear-gradient(135deg, #1a6db5, #2980b9)',
    buttonShadow: '0 4px 18px rgba(26,109,181,0.4)',
    description: 'Submit NOC applications, track status, schedule inspections, and download certificates.',
    warning: 'ℹ️ For property owners, businesses, and assigned inspectors.',
    warningBg: 'rgba(26,109,181,0.07)',
    warningColor: '#1a6db5',
    capabilities: ['Submit digital NOC applications', 'Track application status real-time', 'Download PDF certificates', 'View assigned inspections'],
  },
};

/* ── Component ──────────────────────────────────────────────────────────── */
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
      {/* Decorative glow */}
      <div style={{ ...styles.glow, background: `radial-gradient(circle, ${p.accent}22 0%, transparent 70%)` }} />

      <div style={styles.wrapper}>
        {/* ── Left panel — branding & capabilities ── */}
        <div style={styles.leftPanel}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>🔥</span>
            <div>
              <div style={styles.brandName}>BLAZE</div>
              <div style={styles.brandTagline}>NOC &amp; Fire Safety Platform</div>
            </div>
          </div>

          <div style={{ ...styles.activePortalBadge, background: p.badgeBg, border: `1px solid ${p.badgeBorder}`, color: p.badgeColor }}>
            {p.icon} {p.label} — {p.sublabel}
          </div>

          <p style={styles.leftDesc}>{p.description}</p>

          <ul style={styles.capList}>
            {p.capabilities.map((cap) => (
              <li key={cap} style={styles.capItem}>
                <span style={{ ...styles.capDot, background: p.accent }} />
                {cap}
              </li>
            ))}
          </ul>

          <div style={styles.divider} />
          <p style={styles.leftFooter}>Secured by role-based access control · JWT authenticated</p>
        </div>

        {/* ── Right panel — login form ── */}
        <div style={styles.card}>
          {/* Portal switcher */}
          <div style={styles.portalSwitch}>
            {Object.values(PORTALS).map((pt) => (
              <button
                key={pt.key}
                onClick={() => handlePortalSwitch(pt.key)}
                style={{
                  ...styles.switchBtn,
                  ...(portal === pt.key
                    ? { ...styles.switchBtnActive, borderBottom: `2px solid ${pt.accent}`, color: pt.accent }
                    : {}),
                }}
              >
                <span style={styles.switchIcon}>{pt.icon}</span>
                <span>{pt.label}</span>
              </button>
            ))}
          </div>

          {/* Context notice */}
          <div style={{ ...styles.notice, background: p.warningBg, color: p.warningColor }}>
            {p.warning}
          </div>

          <h2 style={styles.formTitle}>Sign In</h2>
          <p style={styles.formSub}>
            {portal === 'admin' ? 'Fire department administration access' : 'Applicant & inspector access'}
          </p>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ ...styles.input, '--focus-color': p.accent }}
                placeholder={p.placeholder}
                onFocus={(e) => (e.target.style.borderColor = p.accent)}
                onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
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
                style={styles.input}
                placeholder="••••••••"
                onFocus={(e) => (e.target.style.borderColor = p.accent)}
                onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, background: p.buttonBg, boxShadow: p.buttonShadow }}
            >
              {loading ? (
                <span style={styles.loadingRow}>
                  <span style={styles.spinner} /> Signing in…
                </span>
              ) : (
                `Sign In to ${p.label}`
              )}
            </button>
          </form>

          {portal === 'user' && (
            <p style={styles.registerLink}>
              Don&apos;t have an account?{' '}
              <Link to="/register" style={{ color: p.accent, fontWeight: '600' }}>
                Register here
              </Link>
            </p>
          )}

          {portal === 'admin' && (
            <p style={styles.registerLink}>
              Need access?{' '}
              <span style={{ color: p.accent, fontWeight: '600' }}>
                Contact your system administrator
              </span>
            </p>
          )}

          <div style={styles.cardFooter}>
            <span style={styles.secureTag}>🔒 Encrypted &amp; Secure</span>
            <span style={styles.secureTag}>
              Verified by BLAZE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Styles ─────────────────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'background 0.5s ease',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  glow: {
    position: 'absolute',
    width: '700px',
    height: '700px',
    borderRadius: '50%',
    top: '-200px',
    right: '-100px',
    pointerEvents: 'none',
    transition: 'background 0.5s ease',
  },
  wrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: '900px',
    gap: '0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 1,
  },

  /* Left branding panel */
  leftPanel: {
    flex: '0 0 340px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandIcon: { fontSize: '2.2rem' },
  brandName: { fontSize: '1.5rem', fontWeight: '900', color: '#fff', letterSpacing: '1px' },
  brandTagline: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' },
  activePortalBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.2px',
    transition: 'all 0.3s',
  },
  leftDesc: { color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.75 },
  capList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' },
  capItem: { display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' },
  capDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, transition: 'background 0.3s' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.08)', marginTop: 'auto' },
  leftFooter: { color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', lineHeight: 1.6 },

  /* Right form card */
  card: {
    flex: 1,
    background: '#fff',
    padding: '40px 36px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },

  /* Portal switcher tabs */
  portalSwitch: {
    display: 'flex',
    borderBottom: '1px solid #f0f0f0',
    marginBottom: '20px',
    gap: '0',
  },
  switchBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    padding: '12px 8px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#adb5bd',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  switchBtnActive: {
    fontWeight: '700',
    background: 'none',
  },
  switchIcon: { fontSize: '1rem' },

  /* Context notice */
  notice: {
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.8rem',
    fontWeight: '500',
    lineHeight: 1.5,
    marginBottom: '20px',
    transition: 'all 0.3s',
  },

  formTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#1a1a2e', margin: '0 0 4px' },
  formSub: { color: '#6c757d', fontSize: '0.85rem', marginBottom: '20px' },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fdf3f3',
    border: '1px solid rgba(192,57,43,0.25)',
    color: '#c0392b',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    marginBottom: '16px',
  },

  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.825rem', fontWeight: '700', color: '#495057', letterSpacing: '0.2px' },
  input: {
    padding: '11px 14px',
    border: '1.5px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#2c3e50',
  },

  submitBtn: {
    color: '#fff',
    border: 'none',
    padding: '13px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'opacity 0.2s, transform 0.1s',
    letterSpacing: '0.2px',
  },
  loadingRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  spinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.35)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },

  registerLink: { textAlign: 'center', marginTop: '20px', color: '#6c757d', fontSize: '0.875rem' },

  cardFooter: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secureTag: { color: '#adb5bd', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' },
};

export default LoginPage;
