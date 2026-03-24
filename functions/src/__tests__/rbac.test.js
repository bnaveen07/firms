const { authorize, authorizeOwnerOrAdmin } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authorize middleware', () => {
  it('calls next() when user has the required role', () => {
    const req = { user: { role: ROLES.ADMIN } };
    const res = mockRes();
    const next = jest.fn();

    authorize(ROLES.ADMIN)(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 403 when user does not have the required role', () => {
    const req = { user: { role: ROLES.APPLICANT } };
    const res = mockRes();
    const next = jest.fn();

    authorize(ROLES.ADMIN)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when no user is attached to request', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    authorize(ROLES.ADMIN)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows access when user has one of multiple allowed roles', () => {
    const req = { user: { role: ROLES.INSPECTOR } };
    const res = mockRes();
    const next = jest.fn();

    authorize(ROLES.ADMIN, ROLES.INSPECTOR)(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
