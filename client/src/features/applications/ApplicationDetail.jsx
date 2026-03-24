import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetApplicationQuery, useSubmitApplicationMutation, useReviewApplicationMutation } from './applicationsApi';
import StatusBadge from '../../components/common/StatusBadge/StatusBadge';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ApplicationDetail = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { data, isLoading, isError } = useGetApplicationQuery(id);
  const [submitApplication, { isLoading: isSubmitting }] = useSubmitApplicationMutation();
  const [reviewApplication, { isLoading: isReviewing }] = useReviewApplicationMutation();

  if (isLoading) return <div style={styles.loading}>Loading application details...</div>;
  if (isError) return <div style={styles.error}>Failed to load application.</div>;

  const app = data?.application;
  if (!app) return null;

  const handleSubmit = async () => {
    try {
      await submitApplication(id).unwrap();
      toast.success('Application submitted for review');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit');
    }
  };

  const handleApprove = async () => {
    try {
      await reviewApplication({ id, status: 'approved', reviewNotes: 'Approved by admin' }).unwrap();
      toast.success('Application approved');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Rejection reason:');
    if (!reason) return;
    try {
      await reviewApplication({ id, status: 'rejected', rejectionReason: reason }).unwrap();
      toast.error('Application rejected');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reject');
    }
  };

  return (
    <div>
      <div style={styles.breadcrumb}>
        <Link to="/applications" style={styles.link}>Applications</Link> &rsaquo; {app.applicationNumber}
      </div>

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{app.propertyName}</h1>
          <p style={styles.appNum}>{app.applicationNumber}</p>
        </div>
        <div style={styles.headerRight}>
          <StatusBadge status={app.status} size="large" />
          {app.status === 'draft' && (
            <button onClick={handleSubmit} disabled={isSubmitting} style={styles.submitBtn}>
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
          {isAdmin && app.status === 'submitted' && (
            <div style={styles.actionGroup}>
              <button onClick={handleApprove} disabled={isReviewing} style={styles.approveBtn}>✓ Approve</button>
              <button onClick={handleReject} disabled={isReviewing} style={styles.rejectBtn}>✗ Reject</button>
            </div>
          )}
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Property Details</h3>
          <Row label="Type" value={app.propertyType} />
          <Row label="Floor Area" value={app.floorArea ? `${app.floorArea} sq ft` : '—'} />
          <Row label="Floors" value={app.numberOfFloors || '—'} />
          <Row label="Occupancy" value={app.occupancyType || '—'} />
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Address</h3>
          <Row label="Street" value={app.address?.street} />
          <Row label="City" value={app.address?.city} />
          <Row label="State" value={app.address?.state} />
          <Row label="ZIP" value={app.address?.zipCode} />
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Application Info</h3>
          <Row label="Applicant" value={app.applicant?.name} />
          <Row label="Email" value={app.applicant?.email} />
          <Row label="Priority" value={app.priority} />
          <Row label="Inspector" value={app.assignedInspector?.name || 'Not assigned'} />
          {app.submittedAt && <Row label="Submitted" value={format(new Date(app.submittedAt), 'dd MMM yyyy')} />}
          {app.approvedAt && <Row label="Approved" value={format(new Date(app.approvedAt), 'dd MMM yyyy')} />}
        </div>
      </div>

      {(app.reviewNotes || app.rejectionReason) && (
        <div style={styles.notesCard}>
          {app.reviewNotes && <><h4>Review Notes</h4><p>{app.reviewNotes}</p></>}
          {app.rejectionReason && <><h4 style={{ color: '#c0392b' }}>Rejection Reason</h4><p>{app.rejectionReason}</p></>}
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
    <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>{label}</span>
    <span style={{ fontWeight: '600', fontSize: '0.875rem', color: '#2c3e50', textTransform: 'capitalize' }}>{value || '—'}</span>
  </div>
);

const styles = {
  breadcrumb: { marginBottom: '16px', color: '#6c757d', fontSize: '0.9rem' },
  link: { color: '#2980b9' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '1.6rem', color: '#2c3e50', margin: 0 },
  appNum: { color: '#7f8c8d', margin: '4px 0 0', fontFamily: 'monospace' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  submitBtn: { background: '#2980b9', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  approveBtn: { background: '#27ae60', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  rejectBtn: { background: '#c0392b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  actionGroup: { display: 'flex', gap: '8px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' },
  card: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardTitle: { color: '#c0392b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #f0f0f0' },
  notesCard: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  loading: { padding: '40px', textAlign: 'center', color: '#7f8c8d' },
  error: { padding: '40px', textAlign: 'center', color: '#c0392b' },
};

export default ApplicationDetail;
