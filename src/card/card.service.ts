import { Injectable } from '@nestjs/common';

@Injectable()
export class CardService {
  validate(_cardNumber: string): boolean {
    return false;
  }
}
