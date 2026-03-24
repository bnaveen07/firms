import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateApplicationMutation } from './applicationsApi';
import { toast } from 'react-toastify';

const PROPERTY_TYPES = ['residential', 'commercial', 'industrial', 'educational', 'healthcare', 'other'];

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  const [formData, setFormData] = useState({
    propertyName: '',
    propertyType: 'commercial',
    address: { street: '', city: '', state: '', zipCode: '' },
    floorArea: '',
    numberOfFloors: '',
    occupancyType: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createApplication(formData).unwrap();
      toast.success('Application created successfully');
      navigate('/applications');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create application');
    }
  };

  return (
    <div>
      <h1 style={styles.title}>New NOC Application</h1>
      <div style={styles.card}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={styles.sectionHead}>Property Details</h3>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Property Name *</label>
              <input name="propertyName" value={formData.propertyName} onChange={handleChange} style={styles.input} required placeholder="e.g. Green Tower Complex" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Property Type *</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} style={styles.input}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Floor Area (sq ft)</label>
              <input type="number" name="floorArea" value={formData.floorArea} onChange={handleChange} style={styles.input} placeholder="e.g. 5000" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Number of Floors</label>
              <input type="number" name="numberOfFloors" value={formData.numberOfFloors} onChange={handleChange} style={styles.input} placeholder="e.g. 10" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Occupancy Type</label>
              <input name="occupancyType" value={formData.occupancyType} onChange={handleChange} style={styles.input} placeholder="e.g. Office Building" />
            </div>
          </div>

          <h3 style={styles.sectionHead}>Property Address</h3>
          <div style={styles.field}>
            <label style={styles.label}>Street Address *</label>
            <input name="address.street" value={formData.address.street} onChange={handleChange} style={styles.input} required placeholder="123 Main Street" />
          </div>
          <div style={styles.grid3}>
            <div style={styles.field}>
              <label style={styles.label}>City *</label>
              <input name="address.city" value={formData.address.city} onChange={handleChange} style={styles.input} required placeholder="Mumbai" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>State *</label>
              <input name="address.state" value={formData.address.state} onChange={handleChange} style={styles.input} required placeholder="Maharashtra" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>ZIP Code *</label>
              <input name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} style={styles.input} required placeholder="400001" />
            </div>
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={() => navigate('/applications')} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" style={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  title: { fontSize: '1.6rem', color: '#2c3e50', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '10px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  form: {},
  sectionHead: { fontSize: '1rem', color: '#c0392b', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #f0f0f0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '4px' },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#495057' },
  input: { padding: '10px 12px', border: '1.5px solid #dee2e6', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  cancelBtn: { padding: '10px 20px', border: '1.5px solid #dee2e6', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#6c757d' },
  submitBtn: { padding: '10px 24px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' },
};

export default ApplicationForm;
