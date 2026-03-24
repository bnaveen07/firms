import { isValidEmail, isValidPhone, isValidPassword, isValidCoordinate } from '../utils/validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('admin@frims.gov.in')).toBe(true);
    });
    it('rejects invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('accepts passwords with 8+ characters', () => {
      expect(isValidPassword('12345678')).toBe(true);
      expect(isValidPassword('StrongP@ss1')).toBe(true);
    });
    it('rejects short passwords', () => {
      expect(isValidPassword('short')).toBe(false);
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword(null)).toBe(false);
    });
  });

  describe('isValidCoordinate', () => {
    it('accepts valid lat/lng', () => {
      expect(isValidCoordinate(19.076, 72.877)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);
      expect(isValidCoordinate(90, 180)).toBe(true);
    });
    it('rejects out-of-range coordinates', () => {
      expect(isValidCoordinate(91, 0)).toBe(false);
      expect(isValidCoordinate(0, 181)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('accepts valid phone numbers', () => {
      expect(isValidPhone('+91 9876543210')).toBe(true);
      expect(isValidPhone('9876543210')).toBe(true);
    });
  });
});
