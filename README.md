# Vacation House Trading Platform

A full-stack web application that allows users to list, search, and exchange vacation houses.

## Features

- User authentication (JWT & cookies)
- Create, update, and manage house listings
- Availability management system
- House search & filtering
- Swap request system between users
- Real-time messaging between participants
- Notifications system (read/unread)

## Tech Stack

- Backend: Node.js, Express
- Database: MongoDB Atlas
- Authentication: JWT (JSON Web Tokens)
- API: RESTful architecture

## Project Structure

- `/controllers` – request handling logic
- `/models` – database schemas (Mongoose)
- `/routes` – API endpoints
- `/middlewares` – auth, validation, error handling
- `/services` – business logic

## API Highlights

- `POST /api/v1/auth/login`
- `GET /api/v1/houses`
- `POST /api/v1/houses/:id/availability`
- `POST /api/v1/swaps`
- `GET /api/v1/notifications`

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO
cd project
npm install
npm run dev
