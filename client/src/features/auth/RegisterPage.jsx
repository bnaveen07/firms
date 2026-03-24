import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from './authSlice';
import { toast } from 'react-toastify';

const ROLE_OPTIONS = [
  {
    value: 'applicant',
    icon: '🏢',
    label: 'Property Owner / Applicant',
    desc: 'Submit NOC applications, track status, download certificates.',
  },
  {
    value: 'inspector',
    icon: '🔍',
    label: 'Inspector',
    desc: 'Conduct site inspections, submit reports and checklists.',
  },
];

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'applicant',
    phone: '',
    organization: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) {
      toast.success('Registration successful');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glow} />

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

          <div style={styles.leftBadge}>🏢 Citizen &amp; Inspector Registration</div>

          <p style={styles.leftDesc}>
            Join BLAZE to submit fire safety NOC applications, track their progress in real time,
            and receive QR-verified digital certificates — all paperless.
          </p>

          <div style={styles.stepList}>
            {[
              { num: '01', text: 'Create your account' },
              { num: '02', text: 'Submit your NOC application' },
              { num: '03', text: 'Inspector visits &amp; verifies' },
              { num: '04', text: 'Receive digital certificate' },
            ].map(({ num, text }) => (
              <div key={num} style={styles.stepItem}>
                <span style={styles.stepNum}>{num}</span>
                <span style={styles.stepText} dangerouslySetInnerHTML={{ __html: text }} />
              </div>
            ))}
          </div>

          <div style={styles.divider} />
          <p style={styles.leftFooter}>Admin accounts are provisioned by fire department authorities only.</p>
        </div>

        {/* ── Right form card ── */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>Fill in the details below to get started</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Role selector */}
            <div style={styles.field}>
              <label style={styles.label}>I am registering as</label>
              <div style={styles.roleCards}>
                {ROLE_OPTIONS.map(({ value, icon, label, desc }) => (
                  <div
                    key={value}
                    onClick={() => setFormData({ ...formData, role: value })}
                    style={{
                      ...styles.roleCard,
                      ...(formData.role === value ? styles.roleCardActive : {}),
                    }}
                  >
                    <span style={styles.roleIcon}>{icon}</span>
                    <div>
                      <div style={styles.roleLabel}>{label}</div>
                      <div style={styles.roleDesc}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                  onFocus={(e) => (e.target.style.borderColor = '#1a6db5')}
                  onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
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
                  onFocus={(e) => (e.target.style.borderColor = '#1a6db5')}
                  onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
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
                placeholder="john@example.com"
                onFocus={(e) => (e.target.style.borderColor = '#1a6db5')}
                onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Organization / Company</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                style={styles.input}
                placeholder="ABC Properties Ltd."
                onFocus={(e) => (e.target.style.borderColor = '#1a6db5')}
                onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
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
                onFocus={(e) => (e.target.style.borderColor = '#1a6db5')}
                onBlur={(e) => (e.target.style.borderColor = '#dee2e6')}
                required
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p style={styles.loginLink}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1a6db5', fontWeight: '600' }}>
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

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #020d1a 0%, #0c2340 50%, #143d6b 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  glow: {
    position: 'absolute',
    width: '700px',
    height: '700px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,109,181,0.18) 0%, transparent 70%)',
    top: '-200px',
    right: '-100px',
    pointerEvents: 'none',
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
    flex: '0 0 320px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    padding: '40px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandIcon: { fontSize: '2rem' },
  brandName: { fontSize: '1.4rem', fontWeight: '900', color: '#fff', letterSpacing: '1px' },
  brandTagline: { fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' },
  leftBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(26,109,181,0.12)',
    border: '1px solid rgba(26,109,181,0.3)',
    color: '#4da3e8',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  leftDesc: { color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', lineHeight: 1.75 },
  stepList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  stepItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  stepNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(26,109,181,0.2)',
    border: '1px solid rgba(26,109,181,0.4)',
    color: '#4da3e8',
    fontSize: '0.7rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: { color: 'rgba(255,255,255,0.65)', fontSize: '0.83rem' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.08)', marginTop: 'auto' },
  leftFooter: { color: 'rgba(255,255,255,0.22)', fontSize: '0.72rem', lineHeight: 1.6 },

  card: {
    flex: 1,
    background: '#fff',
    padding: '36px 32px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  cardHeader: { marginBottom: '20px' },
  title: { fontSize: '1.4rem', fontWeight: '800', color: '#1a1a2e', margin: 0 },
  subtitle: { color: '#6c757d', fontSize: '0.85rem', marginTop: '4px' },

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

  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.8rem', fontWeight: '700', color: '#495057', letterSpacing: '0.2px' },
  input: {
    padding: '10px 14px',
    border: '1.5px solid #dee2e6',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#2c3e50',
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },

  roleCards: { display: 'flex', flexDirection: 'column', gap: '8px' },
  roleCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 14px',
    border: '1.5px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  roleCardActive: {
    border: '1.5px solid #1a6db5',
    background: 'rgba(26,109,181,0.05)',
  },
  roleIcon: { fontSize: '1.4rem', marginTop: '1px' },
  roleLabel: { fontSize: '0.85rem', fontWeight: '700', color: '#1a1a2e' },
  roleDesc: { fontSize: '0.75rem', color: '#6c757d', marginTop: '2px', lineHeight: 1.5 },

  submitBtn: {
    background: 'linear-gradient(135deg, #1a6db5, #2980b9)',
    color: '#fff',
    border: 'none',
    padding: '13px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '6px',
    boxShadow: '0 4px 18px rgba(26,109,181,0.4)',
    letterSpacing: '0.2px',
  },

  loginLink: { textAlign: 'center', marginTop: '16px', color: '#6c757d', fontSize: '0.875rem' },

  cardFooter: {
    marginTop: '16px',
    paddingTop: '14px',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secureTag: { color: '#adb5bd', fontSize: '0.72rem' },
};

export default RegisterPage;
