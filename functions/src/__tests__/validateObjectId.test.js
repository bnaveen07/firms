const { validateObjectId } = require('../middleware/validateObjectId');
const mongoose = require('mongoose');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('validateObjectId middleware', () => {
  it('calls next() for a valid ObjectId', () => {
    const validId = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: validId } };
    const res = mockRes();
    const next = jest.fn();

    validateObjectId('id')(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid ObjectId', () => {
    const req = { params: { id: 'not-a-valid-id' } };
    const res = mockRes();
    const next = jest.fn();

    validateObjectId('id')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() when param is not present', () => {
    const req = { params: {} };
    const res = mockRes();
    const next = jest.fn();

    validateObjectId('id')(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('validates multiple params', () => {
    const validId1 = new mongoose.Types.ObjectId().toString();
    const req = { params: { id: validId1, userId: 'bad-id' } };
    const res = mockRes();
    const next = jest.fn();

    validateObjectId('id', 'userId')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
