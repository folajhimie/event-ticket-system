import request from 'supertest';
import app from '../../src/app';
// import prisma from '../../src/lib/prisma';
import { prisma } from '../../src/lib/prisma';

jest.mock('../../src/lib/prisma');

describe('Event API Endpoints - Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/events/initialize', () => {
        it('should initialize an event successfully', async () => {
            const mockEvent = {
                id: 'event-1',
                name: 'Concert',
                totalTickets: 100,
                availableTickets: 100,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

            const response = await request(app)
                .post('/api/events/initialize')
                .set('Authorization', 'Bearer valid-token')
                .send({ name: 'Concert', totalTickets: 100 });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe('event-1');
        });

        it('should return 400 for invalid input', async () => {
            const response = await request(app)
                .post('/api/events/initialize')
                .set('Authorization', 'Bearer valid-token')
                .send({ name: '', totalTickets: 100 });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/events/status/:eventId', () => {
        it('should return event status', async () => {
            const mockEvent = {
                id: 'event-1',
                name: 'Concert',
                totalTickets: 100,
                availableTickets: 50,
            };

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
            (prisma.booking.count as jest.Mock).mockResolvedValue(50);
            (prisma.waitingList.count as jest.Mock).mockResolvedValue(10);

            const response = await request(app)
                .get('/api/events/status/event-1');

            expect(response.status).toBe(200);
            expect(response.body.data.availableTickets).toBe(50);
            expect(response.body.data.waitingListCount).toBe(10);
        });
    });
});