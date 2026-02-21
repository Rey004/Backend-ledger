# Backend Ledger

A minimal double-entry ledger system API built with Node.js, Express, and MongoDB.

## Features

- **Authentication** — Register, login, logout with JWT
- **Accounts** — Create accounts, view balances
- **Transactions** — Transfer funds between accounts with idempotency
- **Ledger** — Immutable credit/debit entries for audit trail
- **System Users** — Initial funds injection for new accounts

## Tech Stack

- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (transaction emails)

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accounts` | Create account |
| GET | `/api/accounts` | Get user accounts |
| GET | `/api/accounts/:accountId/balance` | Get balance |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions` | Create transaction |
| POST | `/api/transactions/system/initial-funds` | Add initial funds (system users only) |

## Setup

```bash
npm install
cp .env.example .env  # configure your env variables
npm run dev
```

## Environment Variables

```
MONGO_URI=
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## License

ISC
