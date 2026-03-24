import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from './authSlice';
import { toast } from 'react-toastify';

/* ── Path types ─────────────────────────────────────────────────────────── */
const PATHS = {
  applicant: {
    key: 'applicant',
    icon: '🏢',
    label: 'Property Owner / Applicant',
    tagline: 'Submit NOC applications & track progress',
    accent: '#1a6db5',
    accentLight: 'rgba(26,109,181,0.08)',
    accentBorder: 'rgba(26,109,181,0.25)',
    gradient: 'linear-gradient(135deg, #020d1a 0%, #0c2340 50%, #143d6b 100%)',
    glow: 'rgba(26,109,181,0.18)',
    buttonBg: 'linear-gradient(135deg, #1a6db5, #2980b9)',
    buttonShadow: '0 4px 18px rgba(26,109,181,0.4)',
    bullets: [
      'Submit digital NOC applications',
      'Track application status in real time',
      'Download QR-verified certificates',
      'View inspector visit schedules',
    ],
    leftLabel: '🏢 Citizen Registration',
    leftLabelColor: '#4da3e8',
    leftLabelBg: 'rgba(26,109,181,0.12)',
    leftLabelBorder: 'rgba(26,109,181,0.3)',
  },
  inspector: {
    key: 'inspector',
    icon: '🔍',
    label: 'Fire Department Inspector',
    tagline: 'Conduct inspections & submit field reports',
    accent: '#16a34a',
    accentLight: 'rgba(22,163,74,0.08)',
    accentBorder: 'rgba(22,163,74,0.25)',
    gradient: 'linear-gradient(135deg, #021208 0%, #052e16 50%, #0a4a26 100%)',
    glow: 'rgba(22,163,74,0.15)',
    buttonBg: 'linear-gradient(135deg, #16a34a, #22c55e)',
    buttonShadow: '0 4px 18px rgba(22,163,74,0.4)',
    bullets: [
      'View assigned inspection tasks',
      'GPS check-in at premises',
      'Submit photo evidence & checklists',
      'Offline-capable mobile interface',
    ],
    leftLabel: '🔍 Inspector Registration',
    leftLabelColor: '#4ade80',
    leftLabelBg: 'rgba(22,163,74,0.12)',
    leftLabelBorder: 'rgba(22,163,74,0.3)',
  },
};

/* ── Component ──────────────────────────────────────────────────────────── */
const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [path, setPath] = useState('applicant');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    organization: '',
    inspectorCode: '',
  });

  const p = PATHS[path];

  const handlePathSwitch = (key) => {
    setPath(key);
    setFormData({ name: '', email: '', password: '', phone: '', organization: '', inspectorCode: '' });
    dispatch(clearError());
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(register({ ...formData, role: path }));
    if (register.fulfilled.match(result)) {
      toast.success('Account created successfully');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  const focusStyle = (accent) => ({
    onFocus: (e) => (e.target.style.borderColor = accent),
    onBlur: (e) => (e.target.style.borderColor = '#dee2e6'),
  });

  return (
    <div style={{ ...styles.page, background: p.gradient }}>
      <div style={{ ...styles.glow, background: `radial-gradient(circle, ${p.glow} 0%, transparent 70%)` }} />

      <div style={styles.wrapper}>
        {/* ── Left branding panel ── */}
        <div style={styles.leftPanel}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>🔥</span>
            <div>
              <div style={styles.brandName}>BLAZE</div>
              <div style={styles.brandTagline}>NOC &amp; Fire Safety Platform</div>
            </div>
          </div>

          <div style={{ ...styles.leftBadge, background: p.leftLabelBg, border: `1px solid ${p.leftLabelBorder}`, color: p.leftLabelColor }}>
            {p.leftLabel}
          </div>

          <p style={styles.leftDesc}>{p.tagline}</p>

          <ul style={styles.bulletList}>
            {p.bullets.map((b) => (
              <li key={b} style={styles.bulletItem}>
                <span style={{ ...styles.bulletDot, background: p.accent }} />
                {b}
              </li>
            ))}
          </ul>

          {path === 'inspector' && (
            <div style={styles.codeHint}>
              <div style={styles.codeHintTitle}>🔑 Authorization Code Required</div>
              <p style={styles.codeHintText}>
                Inspector accounts are restricted to authorised fire department personnel.
                Contact your department administrator to receive your unique access code before registering.
              </p>
            </div>
          )}

          {path === 'applicant' && (
            <div style={styles.stepList}>
              {[
                { num: '01', text: 'Create your account' },
                { num: '02', text: 'Submit NOC application' },
                { num: '03', text: 'Inspector visits & verifies' },
                { num: '04', text: 'Receive digital certificate' },
              ].map(({ num, text }) => (
                <div key={num} style={styles.stepItem}>
                  <span style={{ ...styles.stepNum, background: p.accentLight, border: `1px solid ${p.accentBorder}`, color: p.accent }}>{num}</span>
                  <span style={styles.stepText}>{text}</span>
                </div>
              ))}
            </div>
          )}

          <div style={styles.divider} />
          <p style={styles.leftFooter}>Admin accounts are provisioned by fire department authorities only.</p>
        </div>

        {/* ── Right form card ── */}
        <div style={styles.card}>
          {/* Path switcher */}
          <div style={styles.switcher}>
            {Object.values(PATHS).map((pt) => (
              <button
                key={pt.key}
                onClick={() => handlePathSwitch(pt.key)}
                style={{
                  ...styles.switchBtn,
                  ...(path === pt.key
                    ? { color: pt.accent, borderBottom: `2px solid ${pt.accent}`, fontWeight: '700' }
                    : {}),
                }}
              >
                {pt.icon} {pt.key === 'applicant' ? 'Applicant' : 'Inspector'}
              </button>
            ))}
          </div>

          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>{p.tagline}</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Inspector — Authorization Code gate (shown first) */}
          {path === 'inspector' && (
            <div style={{ ...styles.codeGate, background: p.accentLight, border: `1px solid ${p.accentBorder}` }}>
              <div style={styles.codeGateHeader}>
                <span style={{ fontSize: '1.3rem' }}>🔑</span>
                <div>
                  <div style={{ ...styles.codeGateTitle, color: p.accent }}>Department Authorization Code</div>
                  <div style={styles.codeGateDesc}>
                    Enter the code issued by your fire department administrator to proceed.
                  </div>
                </div>
              </div>
              <input
                type="text"
                name="inspectorCode"
                value={formData.inspectorCode}
                onChange={handleChange}
                style={{ ...styles.input, borderColor: formData.inspectorCode ? p.accent : '#dee2e6', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase' }}
                placeholder="e.g. DEPT-A1B2-BLAZE"
                {...focusStyle(p.accent)}
                required
              />
              <p style={styles.codeGateNote}>
                Don't have a code? Contact your fire department administrator at <strong>admin@firesafety.gov</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row2}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="John Doe"
                  {...focusStyle(p.accent)}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  {...focusStyle(p.accent)}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder={path === 'inspector' ? 'inspector@firesafety.gov' : 'john@example.com'}
                {...focusStyle(p.accent)}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                {path === 'inspector' ? 'Fire Station / Department' : 'Organization / Company'}
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                style={styles.input}
                placeholder={path === 'inspector' ? 'Central Fire Station, Zone 4' : 'ABC Properties Ltd.'}
                {...focusStyle(p.accent)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                placeholder="8+ characters"
                {...focusStyle(p.accent)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, background: p.buttonBg, boxShadow: p.buttonShadow }}
            >
              {loading ? 'Creating account…' : `Register as ${path === 'inspector' ? 'Inspector' : 'Applicant'} →`}
            </button>
          </form>

          <p style={styles.loginLink}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: p.accent, fontWeight: '600' }}>
              Sign in
            </Link>
          </p>

          <div style={styles.cardFooter}>
            <span style={styles.secureTag}>🔒 Secure &amp; Encrypted</span>
            <span style={styles.secureTag}>Verified by BLAZE</span>
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
    maxWidth: '960px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
    position: 'relative',
    zIndex: 1,
  },

  leftPanel: {
    flex: '0 0 300px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    padding: '36px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon: { fontSize: '1.9rem' },
  brandName: { fontSize: '1.3rem', fontWeight: '900', color: '#fff', letterSpacing: '0.5px' },
  brandTagline: { fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' },
  leftBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontWeight: '700',
    transition: 'all 0.3s',
  },
  leftDesc: { color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', lineHeight: 1.7 },
  bulletList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' },
  bulletItem: { display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.65)', fontSize: '0.83rem' },
  bulletDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, transition: 'background 0.3s' },

  codeHint: {
    background: 'rgba(22,163,74,0.08)',
    border: '1px solid rgba(22,163,74,0.2)',
    borderRadius: '10px',
    padding: '14px',
  },
  codeHintTitle: { color: '#4ade80', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' },
  codeHintText: { color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', lineHeight: 1.65 },

  stepList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  stepItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  stepNum: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    fontSize: '0.68rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s',
  },
  stepText: { color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' },

  divider: { height: '1px', background: 'rgba(255,255,255,0.07)', marginTop: 'auto' },
  leftFooter: { color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', lineHeight: 1.6 },

  card: {
    flex: 1,
    background: '#fff',
    padding: '32px 28px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },

  switcher: {
    display: 'flex',
    borderBottom: '1px solid #f0f0f0',
    marginBottom: '18px',
  },
  switchBtn: {
    flex: 1,
    padding: '10px 8px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#9ca3af',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },

  cardHeader: { marginBottom: '16px' },
  title: { fontSize: '1.35rem', fontWeight: '800', color: '#111827', margin: 0 },
  subtitle: { color: '#6b7280', fontSize: '0.82rem', marginTop: '4px' },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fef2f2',
    border: '1px solid rgba(220,38,38,0.25)',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    marginBottom: '14px',
  },

  codeGate: {
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  codeGateHeader: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  codeGateTitle: { fontSize: '0.88rem', fontWeight: '700' },
  codeGateDesc: { fontSize: '0.78rem', color: '#6b7280', marginTop: '2px', lineHeight: 1.5 },
  codeGateNote: { fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.5 },

  form: { display: 'flex', flexDirection: 'column', gap: '13px' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.78rem', fontWeight: '700', color: '#374151', letterSpacing: '0.1px' },
  input: {
    padding: '10px 13px',
    border: '1.5px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '0.92rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#111827',
    background: '#fff',
  },

  submitBtn: {
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.92rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '6px',
    letterSpacing: '0.1px',
    transition: 'opacity 0.2s',
  },

  loginLink: { textAlign: 'center', marginTop: '14px', color: '#6b7280', fontSize: '0.85rem' },

  cardFooter: {
    marginTop: '14px',
    paddingTop: '12px',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
  },
  secureTag: { color: '#9ca3af', fontSize: '0.7rem' },
};

export default RegisterPage;
