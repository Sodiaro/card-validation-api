import { CardType } from '../utils/card-type.util';

export interface CardValidationResult {
  valid: boolean;
  cardType: CardType;
  cardNumber: string;
}
