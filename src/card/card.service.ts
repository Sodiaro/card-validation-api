import { Injectable } from '@nestjs/common';
import { luhnCheck } from './utils/luhn.util';
import { detectCardType } from './utils/card-type.util';
import { CardValidationResult } from './interfaces/card-validation-result.interface';

@Injectable()
export class CardService {
  
  validate(cardNumber: string): CardValidationResult {
    const valid = luhnCheck(cardNumber);
    const cardType = detectCardType(cardNumber);

    return {
      valid,
      cardType,
      cardNumber,
    };
  }
}
