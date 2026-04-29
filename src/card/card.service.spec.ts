import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import * as luhnUtil from './utils/luhn.util';
import * as cardTypeUtil from './utils/card-type.util';

describe('CardService', () => {
  let service: CardService;

  let luhnCheckSpy: jest.SpyInstance;
  let detectCardTypeSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardService],
    }).compile();

    service = module.get<CardService>(CardService);

    luhnCheckSpy = jest.spyOn(luhnUtil, 'luhnCheck');
    detectCardTypeSpy = jest.spyOn(cardTypeUtil, 'detectCardType');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Structure

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Valid Card

  describe('when the card number passes Luhn', () => {
    beforeEach(() => {
      luhnCheckSpy.mockReturnValue(true);
      detectCardTypeSpy.mockReturnValue('Visa');
    });

    it('should return valid as true', () => {
      const result = service.validate('4111111111111111');
      expect(result.valid).toBe(true);
    });

    it('should return the detected card type', () => {
      const result = service.validate('4111111111111111');
      expect(result.cardType).toBe('Visa');
    });

    it('should echo back the card number', () => {
      const result = service.validate('4111111111111111');
      expect(result.cardNumber).toBe('4111111111111111');
    });

    it('should call luhnCheck with the provided card number', () => {
      service.validate('4111111111111111');
      expect(luhnCheckSpy).toHaveBeenCalledWith('4111111111111111');
    });

    it('should call detectCardType with the provided card number', () => {
      service.validate('4111111111111111');
      expect(detectCardTypeSpy).toHaveBeenCalledWith('4111111111111111');
    });
  });

  // Invalid Card

  describe('when the card number fails Luhn', () => {
    beforeEach(() => {
      luhnCheckSpy.mockReturnValue(false);
      detectCardTypeSpy.mockReturnValue('Mastercard');
    });

    it('should return valid as false', () => {
      const result = service.validate('5500005555555558');
      expect(result.valid).toBe(false);
    });

    it('should still return the card type even when invalid', () => {
      const result = service.validate('5500005555555558');
      expect(result.cardType).toBe('Mastercard');
    });
  });

  // Unknown Card Type

  describe('when the card type is unknown', () => {
    beforeEach(() => {
      luhnCheckSpy.mockReturnValue(false);
      detectCardTypeSpy.mockReturnValue('Unknown');
    });

    it('should return Unknown as the card type', () => {
      const result = service.validate('9999999999999999');
      expect(result.cardType).toBe('Unknown');
    });
  });

  // Return Shape

  describe('return shape', () => {
    beforeEach(() => {
      luhnCheckSpy.mockReturnValue(true);
      detectCardTypeSpy.mockReturnValue('Visa');
    });

    it('should always return an object with valid, cardType, and cardNumber', () => {
      const result = service.validate('4111111111111111');

      expect(typeof result.valid).toBe('boolean');
      expect(typeof result.cardType).toBe('string');
      expect(typeof result.cardNumber).toBe('string');
    });
  });
});
