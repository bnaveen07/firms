import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from './authSlice';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
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
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo}>🔥 BLAZE</h1>
        </div>
        <h2 style={styles.title}>Create Account</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
            { name: 'password', label: 'Password', type: 'password', placeholder: '8+ characters' },
            { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 98765 43210' },
            { name: 'organization', label: 'Organization', type: 'text', placeholder: 'Company Name' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                style={styles.input}
                placeholder={placeholder}
                required={['name', 'email', 'password'].includes(name)}
              />
            </div>
          ))}
          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
              <option value="applicant">Applicant</option>
              <option value="inspector">Inspector</option>
            </select>
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: { textAlign: 'center', marginBottom: '8px' },
  logo: { fontSize: '2rem', color: '#c0392b' },
  title: { textAlign: 'center', marginBottom: '24px', color: '#2c3e50' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#2c3e50' },
  input: {
    padding: '10px 14px',
    border: '1.5px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    background: '#c0392b',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  footer: { textAlign: 'center', marginTop: '20px', color: '#7f8c8d', fontSize: '0.9rem' },
};

export default RegisterPage;
