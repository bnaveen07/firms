// Pure utility functions test - no DB needed
describe('Utils modules', () => {
  it('logger module loads without errors', () => {
    const logger = require('../utils/logger');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });
});
