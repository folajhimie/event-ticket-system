import { BookingService } from '../../src/services/BookingService';
import { prisma } from '../../src/lib/prisma';
import { BookingStatus } from '../../generated/prisma/client';


jest.mock('../../src/lib/prisma');

describe('BookingService - Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createBooking', () => {
        it('should book ticket when available', async () => {
            const mockEvent = {
                id: 'event-1',
                name: 'Concert',
                availableTickets: 5,
            };

            const mockBooking = {
                id: 'booking-1',
                eventId: 'event-1',
                userId: 'user-1',
                status: BookingStatus.CONFIRMED,
                bookingTime: new Date(),
                cancelledAt: null,
            };

            const mockTx = {
                event: {
                    findUnique: jest.fn().mockResolvedValue(mockEvent),
                    update: jest.fn().mockResolvedValue({ ...mockEvent, availableTickets: 4 }),
                },
                booking: {
                    findFirst: jest.fn().mockResolvedValue(null),
                    create: jest.fn().mockResolvedValue(mockBooking),
                },
                waitingList: {
                    findUnique: jest.fn().mockResolvedValue(null),
                },
            };

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
                return await callback(mockTx);
            });

            const bookingService = new BookingService();

            const result: any = await bookingService.createBooking('event-1', 'user-1');

            expect(result.success).toBe(true);
            expect(result.status).toBe(BookingStatus.CONFIRMED);
            expect(result.bookingId).toBe('booking-1');
        });

        it('should add to waiting list when no tickets available', async () => {
            const mockEvent = {
                id: 'event-1',
                name: 'Concert',
                availableTickets: 0,
            };

            const mockWaitingEntry = {
                id: 'waiting-1',
                eventId: 'event-1',
                userId: 'user-1',
                joinedAt: new Date(),
                notifiedAt: null,
            };

            const mockTx = {
                event: {
                    findUnique: jest.fn().mockResolvedValue(mockEvent),
                },
                booking: {
                    findFirst: jest.fn().mockResolvedValue(null),
                    create: jest.fn().mockResolvedValue({}),
                },
                waitingList: {
                    findUnique: jest.fn().mockResolvedValue(null),
                    create: jest.fn().mockResolvedValue(mockWaitingEntry),
                    count: jest.fn().mockResolvedValue(5),
                },
            };

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
                return await callback(mockTx);
            });

            const bookingService = new BookingService();

            const result: any = await bookingService.createBooking('event-1', 'user-1');

            expect(result.success).toBe(true);
            expect(result.status).toBe(BookingStatus.WAITING);
            expect(result.position).toBe(5);
        });

        it('should throw error for duplicate booking', async () => {
            const mockEvent = {
                id: 'event-1',
                name: 'Concert',
                availableTickets: 5,
            };

            const mockExistingBooking = {
                id: 'existing-booking',
                eventId: 'event-1',
                userId: 'user-1',
                status: BookingStatus.CONFIRMED,
                bookingTime: new Date(),
                cancelledAt: null,
            };

            const mockTx = {
                event: {
                    findUnique: jest.fn().mockResolvedValue(mockEvent),
                },
                booking: {
                    findFirst: jest.fn().mockResolvedValue(mockExistingBooking),
                },
                waitingList: {
                    findUnique: jest.fn().mockResolvedValue(null),
                },
            };

            (prisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
                return await callback(mockTx);
            });
            const bookingService = new BookingService();

            await expect(bookingService.createBooking('event-1', 'user-1'))
                .rejects.toThrow('User already has an active booking or waiting list entry for this event');
        });
    });
});