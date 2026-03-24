import React from 'react';

const STATUS_CONFIG = {
  draft: { label: 'Draft', bg: '#e9ecef', color: '#6c757d' },
  submitted: { label: 'Submitted', bg: '#cce5ff', color: '#004085' },
  under_review: { label: 'Under Review', bg: '#fff3cd', color: '#856404' },
  inspection_scheduled: { label: 'Inspection Scheduled', bg: '#d1ecf1', color: '#0c5460' },
  inspection_in_progress: { label: 'In Progress', bg: '#fff3cd', color: '#856404' },
  approved: { label: 'Approved', bg: '#d4edda', color: '#155724' },
  rejected: { label: 'Rejected', bg: '#f8d7da', color: '#721c24' },
  certificate_issued: { label: 'Certificate Issued', bg: '#d4edda', color: '#155724' },
  active: { label: 'Active', bg: '#f8d7da', color: '#721c24' },
  contained: { label: 'Contained', bg: '#fff3cd', color: '#856404' },
  resolved: { label: 'Resolved', bg: '#d4edda', color: '#155724' },
  closed: { label: 'Closed', bg: '#e9ecef', color: '#6c757d' },
  issued: { label: 'Issued', bg: '#d4edda', color: '#155724' },
  revoked: { label: 'Revoked', bg: '#f8d7da', color: '#721c24' },
  expired: { label: 'Expired', bg: '#e9ecef', color: '#6c757d' },
  scheduled: { label: 'Scheduled', bg: '#cce5ff', color: '#004085' },
  completed: { label: 'Completed', bg: '#d4edda', color: '#155724' },
  cancelled: { label: 'Cancelled', bg: '#e9ecef', color: '#6c757d' },
};

const StatusBadge = ({ status, size = 'normal' }) => {
  const config = STATUS_CONFIG[status] || { label: status, bg: '#e9ecef', color: '#6c757d' };
  const fontSize = size === 'large' ? '0.875rem' : '0.75rem';
  const padding = size === 'large' ? '5px 12px' : '3px 8px';

  return (
    <span
      style={{
        background: config.bg,
        color: config.color,
        padding,
        borderRadius: '4px',
        fontSize,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
