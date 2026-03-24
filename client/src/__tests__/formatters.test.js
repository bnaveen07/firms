import { formatDate, formatStatus, capitalize, truncate } from '../utils/formatters';

describe('Formatters', () => {
  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
    });
    it('returns empty string for falsy input', () => {
      expect(capitalize('')).toBe('');
      expect(capitalize(null)).toBe('');
    });
  });

  describe('formatStatus', () => {
    it('replaces underscores with spaces and title-cases', () => {
      expect(formatStatus('under_review')).toBe('Under Review');
      expect(formatStatus('certificate_issued')).toBe('Certificate Issued');
    });
    it('returns empty string for falsy input', () => {
      expect(formatStatus('')).toBe('');
      expect(formatStatus(null)).toBe('');
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      const long = 'a'.repeat(100);
      expect(truncate(long, 50)).toHaveLength(53); // 50 chars + '...'
    });
    it('does not truncate short strings', () => {
      expect(truncate('short', 50)).toBe('short');
    });
    it('handles null/undefined', () => {
      expect(truncate(null, 50)).toBeNull();
    });
  });

  describe('formatDate', () => {
    it('returns — for null input', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
    });
    it('returns a non-empty string for valid date', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBeTruthy();
      expect(result).not.toBe('—');
    });
  });
});
