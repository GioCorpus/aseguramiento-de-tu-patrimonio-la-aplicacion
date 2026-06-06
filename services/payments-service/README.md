# Payments Service

This service implements the payments microservice for the Aseguramiento de tu Patrimonio platform.

## Features

- `POST /api/payments/spei` - Create a SPEI payment and generate a CLABE
- `POST /api/payments/oxxo` - Create an OXXO payment with payment reference
- `GET /api/payments/:id` - Fetch payment details by ID
- `POST /api/payments/webhook` - Handle webhook updates from payment providers
- `GET /api/payments/clabe` - Generate a new CLABE value

## Quick start

```bash
cd services/payments-service
npm install
npm start
```

The service starts on port `3001` by default.
