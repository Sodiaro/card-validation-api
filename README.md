# Card Validation API

A production-ready REST API that validates card numbers using the Luhn algorithm and detects card network types (Visa, Mastercard, American Express, Verve, Discover, JCB).

Built with Node.js, TypeScript (strict mode), and NestJS.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Architecture and Design Decisions](#architecture-and-design-decisions)
- [Validation Logic](#validation-logic)

---

## Prerequisites

Ensure the following are installed on your machine before proceeding:

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)

Verify your versions:

```bash
node --version
npm --version
```

---

## Installation

**1. Clone the repository:**

```bash
git clone <your-repository-url>
cd card-validation-api
```

**2. Install dependencies:**

```bash
npm install
```

---

## Running the Application

**Development mode** (auto-restarts on file changes):

```bash
npm run start:dev
```

**Production mode:**

```bash
npm run build
npm run start:prod
```

The server starts on **http://localhost:3000** by default.

---

## API Documentation

### `POST /card/validate`

Validates a card number using the Luhn algorithm and identifies the card network.

#### Request

| Field        | Type   | Required | Description                              |
|--------------|--------|----------|------------------------------------------|
| `cardNumber` | string | Yes      | Digit-only string, between 13–19 digits  |

```json
{
  "cardNumber": "4111111111111111"
}
```

#### Success Response — `200 OK`

Returned for all valid requests, regardless of whether the card number passes validation.

```json
{
  "valid": true,
  "cardType": "Visa",
  "cardNumber": "4111111111111111"
}
```

| Field        | Type    | Description                                              |
|--------------|---------|----------------------------------------------------------|
| `valid`      | boolean | Whether the card number passes the Luhn checksum         |
| `cardType`   | string  | Detected card network (`Visa`, `Mastercard`, `American Express`, `Verve`, `Discover`, `JCB`, `Unknown`) |
| `cardNumber` | string  | The card number that was evaluated                       |

#### Error Response — `400 Bad Request`

Returned when the request body is malformed, missing required fields, or contains unexpected properties.

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    "cardNumber must contain only digits and be between 13 and 19 characters long"
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/card/validate"
}
```

#### Example Requests

**Valid Visa card:**
```bash
curl -X POST http://localhost:3000/card/validate \
  -H "Content-Type: application/json" \
  -d '{"cardNumber": "4111111111111111"}'
```

**Valid Mastercard:**
```bash
curl -X POST http://localhost:3000/card/validate \
  -H "Content-Type: application/json" \
  -d '{"cardNumber": "5500005555555559"}'
```

**Invalid card number (fails Luhn):**
```bash
curl -X POST http://localhost:3000/card/validate \
  -H "Content-Type: application/json" \
  -d '{"cardNumber": "4111111111111112"}'
```
```json
{
  "valid": false,
  "cardType": "Visa",
  "cardNumber": "4111111111111112"
}
```

**Missing field:**
```bash
curl -X POST http://localhost:3000/card/validate \
  -H "Content-Type: application/json" \
  -d '{}'
```
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    "cardNumber is required",
    "cardNumber must be a string",
    "cardNumber must contain only digits and be between 13 and 19 characters long"
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/card/validate"
}
```

---

## Running Tests

**Run all tests:**
```bash
npm run test
```

**Run tests in watch mode** (reruns on file save — recommended during development):
```bash
npm run test:watch
```

**Run tests with coverage report:**
```bash
npm run test:cov
```

### Test Coverage

The test suite is split into two layers:

**Unit Tests** — test each piece of logic in complete isolation:
- `luhn.util.spec.ts` — valid cards, invalid cards, edge cases (identical digits, all zeros)
- `card-type.util.spec.ts` — all supported networks, unknown prefixes, Verve/Discover BIN overlap
- `card.service.spec.ts` — service orchestration, return shape contract, spy-based utility isolation

**Integration Tests** — test the full HTTP stack end to end:
- `card.controller.spec.ts` — real NestJS app instance, real HTTP requests via supertest, validates the entire request/response cycle including pipes and filters

---

## Project Structure

src/
├── card/
│   ├── dto/
│   │   └── validate-card.dto.ts              # Input shape and validation rules
│   ├── interfaces/
│   │   └── card-validation-result.interface.ts  # Service-controller response contract
│   ├── utils/
│   │   ├── luhn.util.ts                      # Luhn algorithm (pure function)
│   │   ├── luhn.util.spec.ts                 # Luhn unit tests
│   │   ├── card-type.util.ts                 # Card network detection (pure function)
│   │   └── card-type.util.spec.ts            # Card type unit tests
│   ├── card.controller.ts                    # HTTP layer — routing and delegation only
│   ├── card.controller.spec.ts               # Integration tests
│   ├── card.module.ts                        # Feature module registration
│   ├── card.service.ts                       # Orchestration layer
│   └── card.service.spec.ts                  # Service unit tests
├── common/
│   └── filters/
│       └── http-exception.filter.ts          # Global error response formatter
├── app.module.ts                             # Root application module
└── main.ts                                   # Bootstrap and global configuration

---

## Architecture and Design Decisions

### Framework — NestJS over Express

NestJS was chosen over plain Express for its enforced module system, built-in dependency injection, and decorator-based structure. These features make the codebase predictable at scale — every developer follows the same architectural pattern regardless of their background. Express offers more freedom, which becomes a liability on larger teams.

### TypeScript Strict Mode

`strict: true` is enabled alongside `noImplicitReturns`, `noUnusedLocals`, and `noUnusedParameters`. These settings catch entire categories of bugs at compile time — silent `undefined` returns, unused variables, and type mismatches — before the code ever runs. Disabling strict mode trades short-term convenience for long-term fragility.

### Separation of Concerns

The project enforces a strict three-layer boundary:

- **Controller** — handles HTTP only. Receives the request, calls the service, returns the response. Contains zero business logic.
- **Service** — orchestrates the validation utilities. Knows nothing about HTTP.
- **Utilities** — pure functions with no dependencies. `luhnCheck` and `detectCardType` are framework-agnostic — they could be moved to any Node.js project unchanged.

This separation means each layer can be tested, replaced, or extended independently.

### Validation at the Boundary

All input validation happens at the DTO layer using `class-validator`, before the request reaches the controller or service. Invalid input is rejected immediately with a descriptive error. The service never receives unvalidated data.

The `ValidationPipe` is configured with:
- `whitelist: true` — strips unknown properties silently
- `forbidNonWhitelisted: true` — rejects requests with unknown properties entirely
- `transform: true` — converts the raw JSON body into a typed DTO class instance

### Card Number Constraints — 13 to 19 Digits

The DTO accepts card numbers between 13 and 19 digits. This covers the full range of real-world card lengths:

| Network | Length |
|---|---|
| Visa | 13 or 16 |
| Mastercard | 16 |
| American Express | 15 |
| Verve | 16–19 |
| Maestro | 12–19 |

Hardcoding 16 digits would incorrectly reject valid Amex and Verve cards.

### HTTP Status Codes

The endpoint returns `200 OK` for all successfully processed requests — including ones where `valid` is `false`. A `200` means the server understood and processed the request correctly. The validity of the card number is a business result communicated in the response body, not through the HTTP status code.

`400 Bad Request` is returned only when the request itself is malformed — missing fields, wrong types, or invalid format.

### Consistent Error Format

A global `HttpExceptionFilter` ensures every error response — validation failures, not found, method not allowed — returns the same shape:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": ["..."],
  "timestamp": "...",
  "path": "..."
}
```

This allows API consumers to write a single error handler that works for every possible error from this API.

### Identical Digit Guard in Luhn

The Luhn algorithm is mathematical — numbers like `1111111111111111` can satisfy the checksum by coincidence. A guard in `luhnCheck` explicitly rejects card numbers where all digits are identical. These are mathematically valid but are never issued as real cards.

### Verve Before Discover — BIN Collision Resolution

Verve (Nigeria's national card network) uses BIN prefixes in the `650x` range, which overlaps with Discover's `65xx` range. The card type detection rules are ordered so Verve is checked first, giving it priority for these prefixes. This is the correct behaviour for an API built with the Nigerian market in mind. A comment in the source code documents this decision explicitly.

---

## Validation Logic

### Luhn Algorithm

The Luhn algorithm (ISO/IEC 7812-1) validates that a card number is mathematically well-formed:

1. Starting from the second-to-last digit, double every second digit moving left
2. If doubling produces a value greater than 9, subtract 9
3. Sum all digits
4. If the total is divisible by 10, the number is valid

This does not verify that a card account exists or has funds — it is a checksum that detects typos and randomly guessed numbers.

### Card Type Detection

Card networks are identified by their BIN (Bank Identification Number) — the first 6 digits of the card number. Each network publishes the ranges their cards use. This API encodes those ranges as regular expressions and matches them in priority order.

Supported networks: Visa, Mastercard, American Express, Verve, Discover, JCB.