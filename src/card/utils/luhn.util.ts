export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.split('').map(Number);

  if (digits.every((d) => d === digits[0])) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  // Traverse digits from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i] as number;

    if (shouldDouble) {
      digit *= 2;

      // If doubling exceeds 9, subtract 9
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
