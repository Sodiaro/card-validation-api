import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CardService } from './card.service';
import { ValidateCardDto } from './dto/validate-card.dto';
import { CardValidationResult } from './interfaces/card-validation-result.interface';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Body() dto: ValidateCardDto): CardValidationResult {
    return this.cardService.validate(dto.cardNumber);
  }
}
