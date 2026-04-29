import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

//Integration tests for POST /card/validate
describe('POST /card/validate (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('valid card numbers', () => {
    it('should return 200 with valid:true for a known Visa test number', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: '4111111111111111' })
        .expect(200);

      expect(response.body).toMatchObject({
        valid: true,
        cardType: 'Visa',
        cardNumber: '4111111111111111',
      });
    });

    it('should return 200 with valid:true for a known Mastercard test number', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: '5500005555555559' })
        .expect(200);

      expect(response.body).toMatchObject({
        valid: true,
        cardType: 'Mastercard',
        cardNumber: '5500005555555559',
      });
    });

    it('should return 200 with valid:true for a known Amex test number', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: '378282246310005' })
        .expect(200);

      expect(response.body).toMatchObject({
        valid: true,
        cardType: 'American Express',
        cardNumber: '378282246310005',
      });
    });

    it('should return 200 with valid:true for a known Verve test number', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: '5061460410120225' })
        .expect(200);

      expect(response.body).toMatchObject({
        valid: true,
        cardType: 'Verve',
        cardNumber: '5061460410120225',
      });
    });
  });

  // Invalid Card Numbers

  describe('invalid card numbers', () => {
    it('should return 200 with valid:false for a number that fails Luhn', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: '4111111111111112' })
        .expect(200);

      expect(response.body).toMatchObject({
        valid: false,
        cardType: 'Visa',
        cardNumber: '4111111111111112',
      });
    });

    it('should still detect card type even when Luhn fails', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: '5500005555555558' })
        .expect(200);

      expect(response.body.valid).toBe(false);
      expect(response.body.cardType).toBe('Mastercard');
    });
  });

  // Validation Errors

  describe('invalid request body', () => {
    it('should return 400 when cardNumber is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({})
        .expect(400);

      // Verify our custom error shape from HttpExceptionFilter
      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
      });

      // Details should be an array of specific validation messages
      expect(Array.isArray(response.body.details)).toBe(true);
      expect(response.body.details.length).toBeGreaterThan(0);
    });

    it('should return 400 when cardNumber is not a string', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: 4111111111111111 })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 when cardNumber contains non-digit characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: '4111-1111-1111-1111' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 when cardNumber is too short', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: '411111' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 when cardNumber is too long', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: '41111111111111111111' }) // 20 digits
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 when an unexpected field is included', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: '4111111111111111', hack: 'attempt' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.details).toContain('property hack should not exist');
    });

    it('should return 400 when the body is empty', async () => {
      await request(app.getHttpServer())
        .post('/card/validate')
        .send()
        .expect(400);
    });
  });

  // Error Response Shape

  describe('error response shape', () => {
    it('should include timestamp and path in every error response', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({})
        .expect(400);

      // These fields come from our HttpExceptionFilter
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path', '/card/validate');

      // Timestamp should be a valid ISO 8601 string
      expect(() => new Date(response.body.timestamp as string)).not.toThrow();
    });
  });

  // Success Response Shape

  describe('success response shape', () => {
    it('should always include valid, cardType, and cardNumber in success responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber: '4111111111111111' })
        .expect(200);

      expect(response.body).toHaveProperty('valid');
      expect(response.body).toHaveProperty('cardType');
      expect(response.body).toHaveProperty('cardNumber');
    });

    it('should return exactly the card number that was submitted', async () => {
      const cardNumber = '4111111111111111';

      const response = await request(app.getHttpServer())
        .post('/card/validate')
        .send({ cardNumber })
        .expect(200);

      expect(response.body.cardNumber).toBe(cardNumber);
    });
  });
});
