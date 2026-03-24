const { ROLES, APPLICATION_STATUS, INCIDENT_SEVERITY, INCIDENT_STATUS, NOC_STATUS, AUDIT_ACTIONS } = require('../config/constants');

describe('Constants', () => {
  describe('ROLES', () => {
    it('should define all required roles', () => {
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROLES.APPLICANT).toBe('applicant');
      expect(ROLES.INSPECTOR).toBe('inspector');
      expect(ROLES.VIEWER).toBe('viewer');
    });
  });

  describe('APPLICATION_STATUS', () => {
    it('should define all application status values', () => {
      expect(Object.keys(APPLICATION_STATUS).length).toBeGreaterThan(5);
      expect(APPLICATION_STATUS.DRAFT).toBe('draft');
      expect(APPLICATION_STATUS.SUBMITTED).toBe('submitted');
      expect(APPLICATION_STATUS.APPROVED).toBe('approved');
      expect(APPLICATION_STATUS.REJECTED).toBe('rejected');
    });
  });

  describe('INCIDENT_SEVERITY', () => {
    it('should define all severity levels', () => {
      expect(INCIDENT_SEVERITY.LOW).toBe('low');
      expect(INCIDENT_SEVERITY.MEDIUM).toBe('medium');
      expect(INCIDENT_SEVERITY.HIGH).toBe('high');
      expect(INCIDENT_SEVERITY.CRITICAL).toBe('critical');
    });
  });

  describe('INCIDENT_STATUS', () => {
    it('should define incident statuses', () => {
      expect(INCIDENT_STATUS.ACTIVE).toBe('active');
      expect(INCIDENT_STATUS.RESOLVED).toBe('resolved');
    });
  });

  describe('NOC_STATUS', () => {
    it('should define NOC statuses', () => {
      expect(NOC_STATUS.ISSUED).toBe('issued');
      expect(NOC_STATUS.REVOKED).toBe('revoked');
    });
  });

  describe('AUDIT_ACTIONS', () => {
    it('should define audit actions', () => {
      expect(AUDIT_ACTIONS.CREATE).toBe('create');
      expect(AUDIT_ACTIONS.UPDATE).toBe('update');
      expect(AUDIT_ACTIONS.DELETE).toBe('delete');
      expect(AUDIT_ACTIONS.LOGIN).toBe('login');
    });
  });
});
