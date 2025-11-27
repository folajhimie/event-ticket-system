# Event Ticket Booking System

A robust Event Ticket Booking System built with Node.js, TypeScript, Express, and Prisma ORM with MySQL.

## Features

- Event management with ticket allocation
- Concurrent ticket booking with race condition prevention
- Waiting list management
- Automatic ticket assignment from cancellations
- Rate limiting and authentication
- Comprehensive logging
- Full test coverage with TDD approach

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL with Prisma ORM
- **Testing**: Jest, Supertest
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-ticket-system

# API Documentation
# Events

POST /api/events/initialize - Initialize a new event

GET /api/events - Get all events

GET /api/events/status/:eventId - Get event status

# Bookings

POST /api/events/book - Book a ticket

POST /api/events/cancel - Cancel a booking

GET /api/events/user-bookings/:userId - Get user bookings

# Waiting List

GET /api/waitlist/waiting-list/:eventId - Get waiting list

POST /api/waitlist/create-waitlist - create waitlist 

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch