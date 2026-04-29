import { detectCardType } from './card-type.util';

describe('detectCardType', () => {
  // Known Networks

  describe('Visa', () => {
    it('should detect a standard 16-digit Visa', () => {
      expect(detectCardType('4111111111111111')).toBe('Visa');
    });

    it('should detect a 13-digit Visa', () => {
      expect(detectCardType('4222222222222')).toBe('Visa');
    });
  });

  describe('Mastercard', () => {
    it('should detect Mastercard in the classic 51–55 range', () => {
      expect(detectCardType('5500005555555559')).toBe('Mastercard');
    });

    it('should detect Mastercard in the newer 2221–2720 range', () => {
      expect(detectCardType('2720992143323550')).toBe('Mastercard');
    });

    it('should detect Mastercard starting with 51', () => {
      expect(detectCardType('5105105105105100')).toBe('Mastercard');
    });
  });

  describe('American Express', () => {
    it('should detect Amex starting with 34', () => {
      expect(detectCardType('341111111111111')).toBe('American Express');
    });

    it('should detect Amex starting with 37', () => {
      expect(detectCardType('378282246310005')).toBe('American Express');
    });
  });

  describe('Verve', () => {
    it('should detect Verve starting with 5061', () => {
      expect(detectCardType('5061460410120223')).toBe('Verve');
    });

    it('should detect Verve starting with 6500', () => {
      expect(detectCardType('6500000000000002')).toBe('Verve');
    });

    it('should prioritise Verve over Discover for overlapping 650x prefixes', () => {
      expect(detectCardType('6500000000000002')).toBe('Verve');
      expect(detectCardType('6500000000000002')).not.toBe('Discover');
    });
  });

  describe('Discover', () => {
    it('should detect Discover starting with 6011', () => {
      expect(detectCardType('6011111111111117')).toBe('Discover');
    });

    it('should detect Discover starting with 65', () => {
      expect(detectCardType('6555555555555558')).toBe('Discover');
    });
  });

  describe('JCB', () => {
    it('should detect JCB in the 3528–3589 range', () => {
      expect(detectCardType('3530111333300000')).toBe('JCB');
    });
  });

  // Unknown

  describe('Unknown', () => {
    it('should return Unknown for an unrecognised prefix', () => {
      expect(detectCardType('9999999999999999')).toBe('Unknown');
    });

    it('should return Unknown for a prefix starting with 8', () => {
      expect(detectCardType('8000000000000000')).toBe('Unknown');
    });
  });
});
