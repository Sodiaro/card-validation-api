import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class ValidateCardDto {
  @IsString({ message: 'cardNumber must be a string' })
  @IsNotEmpty({ message: 'cardNumber is required' })
  @Matches(/^\d{13,19}$/, {
    message:
      'cardNumber must contain only digits and be between 13 and 19 characters long',
  })
  cardNumber!: string;
}
