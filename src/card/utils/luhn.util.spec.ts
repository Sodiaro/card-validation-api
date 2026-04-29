import { luhnCheck } from './luhn.util';

describe('luhnCheck', () => {
  // Valid Card Numbers

  describe('valid card numbers', () => {
    it('should return true for a valid Visa test number', () => {
      expect(luhnCheck('4111111111111111')).toBe(true);
    });

    it('should return true for a valid Mastercard test number', () => {
      expect(luhnCheck('5500005555555559')).toBe(true);
    });

    it('should return true for a valid Amex test number', () => {
      expect(luhnCheck('378282246310005')).toBe(true);
    });

    it('should return true for a valid 13-digit Visa number', () => {
      expect(luhnCheck('4222222222222')).toBe(true);
    });

    it('should return true for a valid Mastercard in the 2xxx range', () => {
      expect(luhnCheck('2221000000000009')).toBe(true);
    });
  });

  // Invalid Card Numbers

  describe('invalid card numbers', () => {
    it('should return false when the last digit is altered', () => {
      // 4111111111111111 is valid — changing last digit breaks the checksum
      expect(luhnCheck('4111111111111112')).toBe(false);
    });

    it('should return false for a randomly constructed number', () => {
      expect(luhnCheck('1234567890123456')).toBe(false);
    });

    it('should return false for a number that is one digit off', () => {
      expect(luhnCheck('5500005555555558')).toBe(false);
    });
  });

  // Edge Case

  describe('edge cases', () => {
    it('should return false for a number made of all identical digits', () => {
      // Identical-digit numbers can pass Luhn mathematically but are not real cards
      expect(luhnCheck('1111111111111111')).toBe(false);
    });

    it('should return false for all zeros', () => {
      expect(luhnCheck('0000000000000000')).toBe(false);
    });

    it('should return false for all nines', () => {
      expect(luhnCheck('9999999999999999')).toBe(false);
    });

    it('should handle a 19-digit number correctly', () => {
      // Maestro cards can be up to 19 digits
      expect(luhnCheck('6304000000000000001')).toBe(false);
    });
  });
});
