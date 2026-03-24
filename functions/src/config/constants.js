module.exports = {
  ROLES: {
    ADMIN: 'admin',
    APPLICANT: 'applicant',
    INSPECTOR: 'inspector',
    VIEWER: 'viewer',
  },

  APPLICATION_STATUS: {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    INSPECTION_SCHEDULED: 'inspection_scheduled',
    INSPECTION_IN_PROGRESS: 'inspection_in_progress',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CERTIFICATE_ISSUED: 'certificate_issued',
  },

  INCIDENT_SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },

  INCIDENT_STATUS: {
    ACTIVE: 'active',
    CONTAINED: 'contained',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
  },

  NOC_STATUS: {
    PENDING: 'pending',
    ISSUED: 'issued',
    REVOKED: 'revoked',
    EXPIRED: 'expired',
  },

  AUDIT_ACTIONS: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    VIEW: 'view',
    APPROVE: 'approve',
    REJECT: 'reject',
    ISSUE_CERTIFICATE: 'issue_certificate',
    LOGIN: 'login',
    LOGOUT: 'logout',
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
};
