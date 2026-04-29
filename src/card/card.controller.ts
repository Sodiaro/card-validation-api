import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CardService } from './card.service';
import { ValidateCardDto } from './dto/validate-card.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Body() dto: ValidateCardDto): Record<string, unknown> {
    const result = this.cardService.validate(dto.cardNumber);
    return { valid: result };
  }
}
