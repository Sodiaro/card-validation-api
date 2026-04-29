import { Controller, Post, Body } from '@nestjs/common';
import { CardService } from './card.service';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('validate')
  validate(@Body() body: Record<string, unknown>): Record<string, unknown> {
    const result = this.cardService.validate(String(body['cardNumber'] ?? ''));
    return { valid: result };
  }
}
