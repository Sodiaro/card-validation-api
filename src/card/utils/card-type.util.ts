//Supported card network types
export type CardType =
  | 'Visa'
  | 'Mastercard'
  | 'American Express'
  | 'Verve'
  | 'Discover'
  | 'JCB'
  | 'Unknown';

interface CardTypeRule {
  type: CardType;
  pattern: RegExp;
}

//Ordered list of card type detection rules
const CARD_TYPE_RULES: CardTypeRule[] = [
  {
    type: 'American Express',
    pattern: /^3[47]/,
  },
  {
    type: 'Mastercard',
    pattern: /^(5[1-5]|2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720))/,
  },
  {
    type: 'Verve',
    pattern: /^(5061|6500|6501|6502|650[0-9])/,
  },
  {
    type: 'Discover',
    pattern:
      /^(6011|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5])|64[4-9]|65)/,
  },
  {
    type: 'JCB',
    pattern: /^35(2[89]|[3-8]\d)/,
  },
  {
    type: 'Visa',
    pattern: /^4/,
  },
];

//Detects the card network type from a card number string
export function detectCardType(cardNumber: string): CardType {
  for (const rule of CARD_TYPE_RULES) {
    if (rule.pattern.test(cardNumber)) {
      return rule.type;
    }
  }

  return 'Unknown';
}
