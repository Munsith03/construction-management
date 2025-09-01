# Food Delivery System

A cloud-native food ordering and delivery platform built with microservices.

## Setup

1. Clone the repo: `git clone <repo-url>`
2. Install dependencies: `npm install` in each service folder.
3. Set up `.env` files with appropriate credentials.
4. Run services: `npm run dev` (development) or `npm start` (production) in each service folder.
5. Start frontend: `npm run dev` in `/frontend` (Vite dev server).

## Development Tools

- Lint: `npm run lint`
- Format: `npm run format`

## Services

- User Service: `localhost:3001`
- Restaurant Service: `localhost:3002`
- Order Service: `localhost:3003`
- Delivery Service: `localhost:3004`
- Payment Service: `localhost:3005`
- Notification Service: `localhost:3006`
- Frontend: `localhost:5173` (default Vite port)
