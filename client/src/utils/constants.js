export const ROLES = {
  ADMIN: 'admin',
  APPLICANT: 'applicant',
  INSPECTOR: 'inspector',
};

export const INCIDENT_SEVERITIES = ['low', 'medium', 'high', 'critical'];
export const INCIDENT_TYPES = ['fire', 'explosion', 'chemical_leak', 'structural', 'other'];
export const PROPERTY_TYPES = ['residential', 'commercial', 'industrial', 'educational', 'healthcare', 'other'];
export const APPLICATION_STATUSES = [
  'draft', 'submitted', 'under_review', 'inspection_scheduled',
  'inspection_in_progress', 'approved', 'rejected', 'certificate_issued'
];

export const DEFAULT_MAP_CENTER = [20.5937, 78.9629];
export const DEFAULT_MAP_ZOOM = 5;
