import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from './authSlice';
import { toast } from 'react-toastify';

const PATHS = {
  applicant: {
    key: 'applicant',
    icon: '🏢',
    label: 'Applicant',
    accent: '#1a6db5',
    gradient: 'linear-gradient(135deg, #020d1a 0%, #0c2340 100%)',
  },
  inspector: {
    key: 'inspector',
    icon: '🔍',
    label: 'Inspector',
    accent: '#16a34a',
    gradient: 'linear-gradient(135deg, #021208 0%, #052e16 100%)',
  },
};

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [path, setPath] = useState('applicant');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', organization: '', inspectorCode: '' });

  const p = PATHS[path];

  const handlePathSwitch = (key) => {
    setPath(key);
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

  return (
    <div style={{ ...styles.page, background: p.gradient }}>
      <div style={styles.wrapper} className="register-wrapper">
        <div style={styles.leftPanel} className="register-left-panel">
          <div style={styles.brand}>
            <span style={styles.brandIcon}>🔥</span>
            <div>
              <div style={styles.brandName}>BLAZE</div>
              <div style={styles.brandTagline}>Registration</div>
            </div>
          </div>
          <h2 style={{ color: '#fff', margin: '20px 0 10px' }}>Join the Network</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Secure fire safety management for buildings and locations.</p>
        </div>

        <div style={styles.card}>
          <div style={styles.switcher}>
            {Object.values(PATHS).map((pt) => (
              <button
                key={pt.key}
                onClick={() => handlePathSwitch(pt.key)}
                style={{
                  ...styles.switchBtn,
                  ...(path === pt.key ? { color: pt.accent, borderBottomColor: pt.accent } : {}),
                }}
              >
                {pt.icon} {pt.label}
              </button>
            ))}
          </div>

          <h2 style={styles.title}>Create Account</h2>
          {error && <div className="blaze-error-box" style={{ marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleSubmit} className="register-form-grid">
            <div className="field-group">
              <label style={styles.label}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="blaze-input" placeholder="John Doe" required />
            </div>
            <div className="field-group">
              <label style={styles.label}>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="blaze-input" placeholder="+91" />
            </div>
            <div className="field-group" style={{ gridColumn: 'span 1' }}>
              <label style={styles.label}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="blaze-input" placeholder="email@example.com" required />
            </div>
            <div className="field-group">
              <label style={styles.label}>{path === 'inspector' ? 'Fire Station' : 'Organization'}</label>
              <input type="text" name="organization" value={formData.organization} onChange={handleChange} className="blaze-input" required />
            </div>
            <div className="field-group">
              <label style={styles.label}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="blaze-input" required />
            </div>
            {path === 'inspector' && (
              <div className="field-group">
                <label style={styles.label}>Auth Code</label>
                <input type="text" name="inspectorCode" value={formData.inspectorCode} onChange={handleChange} className="blaze-input" placeholder="DEPT-XXXX" required />
              </div>
            )}
            <button type="submit" disabled={loading} className="blaze-btn blaze-btn-primary" style={{ gridColumn: '1 / -1', marginTop: '10px', background: p.accent }}>
              {loading ? 'Creating account...' : 'Register Now'}
            </button>
          </form>

          <p style={styles.loginLink}>Already have an account? <Link to="/login" style={{ color: p.accent, fontWeight: '600' }}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  wrapper: { display: 'flex', width: '100%', maxWidth: '850px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' },
  leftPanel: { flex: '0 0 260px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', padding: '40px 25px' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon: { fontSize: '1.8rem' },
  brandName: { fontSize: '1.2rem', fontWeight: '900', color: '#fff' },
  brandTagline: { fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
  card: { flex: 1, background: '#fff', padding: '30px' },
  switcher: { display: 'flex', borderBottom: '1px solid #f0f0f0', marginBottom: '20px' },
  switchBtn: { flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: '2px solid transparent', fontSize: '0.85rem', fontWeight: '600', color: '#999', cursor: 'pointer' },
  title: { fontSize: '1.4rem', fontWeight: '800', marginBottom: '20px' },
  label: { fontSize: '0.75rem', fontWeight: '700', color: '#666', display: 'block', marginBottom: '4px' },
  loginLink: { textAlign: 'center', marginTop: '15px', color: '#666', fontSize: '0.85rem' },
};

export default RegisterPage;
