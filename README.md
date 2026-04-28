# SwapHomes Dissertation Project

SwapHomes is a full-stack property swap platform built for a dissertation project. Users can register, publish houses, browse available listings, request swaps, accept or reject requests, chat around a swap, receive notifications, upload listing photos, and review other users after completed swaps.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT cookie authentication, Zod validation
- Frontend: React, Vite, React Router, Axios
- Testing: Jest, Supertest, ESLint
- Image hosting: Cloudinary signed uploads

## Main Features

- User registration, login, logout, profile updates, password changes, and account deactivation
- House creation, editing, publishing, draft mode, photo management, and availability ranges
- Public house search by location, capacity, date availability, and keyword
- Swap requests with ownership checks, availability validation, acceptance, rejection, cancellation rules, and double-booking protection
- Swap conversations with message notifications
- Notification inbox with unread counts and read/delete actions
- User reviews after an accepted swap has ended

## Project Structure

```text
.
├── src/                      # Express API
│   ├── app.js                # App middleware and route mounting
│   ├── server.js             # Database connection and server start
│   ├── config/               # Environment, CORS, database config
│   ├── modules/              # Feature modules
│   │   ├── auth/
│   │   ├── houses/
│   │   ├── messages/
│   │   ├── notifications/
│   │   ├── reviews/
│   │   ├── swaps/
│   │   ├── uploads/
│   │   └── users/
│   ├── shared/               # Shared errors, middleware, logger, utilities
│   └── tests/                # Jest/Supertest tests
└── frontend/                 # React/Vite client
    └── src/
        ├── api/              # Axios API helpers
        ├── components/
        └── pages/
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection string
- Cloudinary account for image uploads

## Environment Setup

Create a backend `.env` file in the project root by copying `.env.example`.

```bash
cp .env.example .env
```

Set these values:

```env
NODE_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/property_swap
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=15m
LOG_LEVEL=info
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=property_swap/houses
```

For the frontend, create `frontend/.env` if you need a custom API URL:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Installation

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Running The App

Start MongoDB first, then run the backend from the project root:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:5000/api/v1
```

Run the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The Vite app usually runs at:

```text
http://localhost:5173
```

## Useful Commands

Backend tests:

```bash
npm test
```

If Jest worker processes are blocked on Windows, run:

```bash
npx jest --runInBand
```

Frontend lint:

```bash
cd frontend
npm run lint
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Demo Flow

1. Register two users.
2. User A creates and publishes a house with future availability.
3. User B creates and publishes a house with matching availability.
4. User B opens User A's house and sends a swap request.
5. User A accepts or rejects the request from Swap Requests.
6. Both users can open the swap chat and exchange messages.
7. After the swap end date has passed, either user can review the other from My Swaps.
8. Public user profiles show received reviews and average rating.

## Notes For Dissertation Evaluation

- `.env` contains local secrets and must not be committed.
- `.env.example` documents required configuration without real secrets.
- The system uses HTTP-only cookies for authentication.
- Swap acceptance reserves both houses' availability and rejects overlapping pending swaps to prevent double booking.
- Reviews are limited to accepted swaps after the swap has ended.
