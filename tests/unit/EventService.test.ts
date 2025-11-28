import { EventService } from '../../src/services/EventService';
// import prisma from '../../src/lib/prisma';
import { BookingStatus } from '../../generated/prisma/client'; 
import { prisma } from '../../src/lib/prisma';

jest.mock('../../src/lib/prisma');

describe('EventService - Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createEvent', () => {
        it('should create an event with valid parameters', async () => {
            const mockEvent = {
                id: 'event-1',
                name: 'Test Concert',
                totalTickets: 100,
                availableTickets: 100,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);
            const eventService = new EventService();

            const result = await eventService.createEvent('Test Concert', 100);

            expect(prisma.event.create).toHaveBeenCalledWith({
                data: {
                    name: 'Test Concert',
                    totalTickets: 100,
                    availableTickets: 100,
                },
            });
            expect(result.id).toBe('event-1');
            expect(result.totalTickets).toBe(100);
        });

        it('should throw error for empty event name', async () => {
            const eventService = new EventService();
            await expect(eventService.createEvent('', 100))
                .rejects.toThrow('Event name is required');
        });

        it('should throw error for invalid ticket count', async () => {
            const eventService = new EventService();
            await expect(eventService.createEvent('Test Event', 0))
                .rejects.toThrow('Total tickets must be greater than 0');
        });
    });

    describe('getEventStatus', () => {
        it('should return event status with counts', async () => {
            const mockEvent = {
                id: 'event-1',
                name: 'Concert',
                totalTickets: 100,
                availableTickets: 50,
            };

            (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
            (prisma.booking.count as jest.Mock).mockResolvedValue(50);
            (prisma.waitingList.count as jest.Mock).mockResolvedValue(10);

            const eventService = new EventService();

            const result = await eventService.getEventStatus('event-1');

            expect(result.eventId).toBe('event-1');
            expect(result.availableTickets).toBe(50);
            expect(result.confirmedBookings).toBe(50);
            expect(result.waitingListCount).toBe(10);
        });

        it('should throw error for non-existent event', async () => {
            (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

            const eventService = new EventService();

            await expect(eventService.getEventStatus('non-existent'))
                .rejects.toThrow('Event not found');
        });
    });
});