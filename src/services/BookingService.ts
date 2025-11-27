
// import prisma from '../lib/prisma';
import { prisma } from '../../src/lib/prisma';
import { Booking, BookingStatus } from '../../generated/prisma/client';
import { BookingResult, CancellationResult } from '../types';

export class BookingService {
    async createBooking(eventId: string, userId: string): Promise<BookingResult> {
        if (!eventId || !userId) {
            throw new Error('Event ID and User ID are required');
        }

        return await prisma.$transaction(async (tx: any) => {
            const user = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new Error('User not found');
            }
            // Check if event exists and get current state
            const event = await tx.event.findUnique({
                where: { id: eventId },
                select: {
                    id: true,
                    name: true,
                    availableTickets: true,
                },
            });

            if (!event) {
                throw new Error('Event not found');
            }

            // Check for existing active booking or waiting list entry
            const existingActiveEntry = await tx.booking.findFirst({
                where: {
                    eventId,
                    userId,
                    status: {
                        in: [BookingStatus.CONFIRMED, BookingStatus.WAITING],
                    },
                },
            });

            if (existingActiveEntry) {
                throw new Error('User already has an active booking or waiting list entry for this event');
            }

            const existingWaitingList = await tx.waitingList.findUnique({
                where: {
                    userId_eventId: {
                        userId,
                        eventId,
                    },
                },
            });

            if (existingWaitingList) {
                throw new Error('User is already in waiting list for this event');
            }

            // Try to book ticket if available
            if (event.availableTickets > 0) {
                // Decrement available tickets and create booking atomically
                const [updatedEvent, booking] = await Promise.all([
                    tx.event.update({
                        where: { id: eventId },
                        data: { availableTickets: { decrement: 1 } },
                    }),
                    tx.booking.create({
                        data: {
                            eventId,
                            userId,
                            status: BookingStatus.CONFIRMED,
                        },
                    }),
                ]);

                return {
                    success: true,
                    bookingId: booking.id,
                    status: BookingStatus.CONFIRMED,
                    message: 'Ticket booked successfully',
                };
            } else {
                // Add to waiting list
                const waitingEntry = await tx.waitingList.create({
                    data: {
                        eventId,
                        userId,
                    },
                });

                // Get position in waiting list
                const position = await tx.waitingList.count({
                    where: {
                        eventId,
                        joinedAt: { lte: waitingEntry.joinedAt },
                    },
                });

                // Create a waiting status booking record
                await tx.booking.create({
                    data: {
                        eventId,
                        userId,
                        status: BookingStatus.WAITING,
                    },
                });

                return {
                    success: true,
                    waitingId: waitingEntry.id,
                    status: BookingStatus.WAITING,
                    position,
                    message: 'Added to waiting list',
                };
            }
        }, {
            maxWait: 5000,
            timeout: 10000,
        });
    }

    async cancelBooking(bookingId: string): Promise<CancellationResult> {
        if (!bookingId) {
            throw new Error('Booking ID is required');
        }

        return await prisma.$transaction(async (tx: any) => {
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
                include: { event: true },
            });

            if (!booking) {
                throw new Error('Booking not found');
            }

            if (booking.status !== BookingStatus.CONFIRMED) {
                throw new Error('Only confirmed bookings can be cancelled');
            }

            // Cancel the booking
            const cancelledBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: BookingStatus.CANCELLED,
                    cancelledAt: new Date(),
                },
            });

            // Return ticket to pool
            await tx.event.update({
                where: { id: booking.eventId },
                data: { availableTickets: { increment: 1 } },
            });

            // Check waiting list for automatic assignment
            const nextInLine = await tx.waitingList.findFirst({
                where: { eventId: booking.eventId },
                orderBy: { joinedAt: 'asc' },
            });

            let assignedTo: string | undefined;

            if (nextInLine) {
                // Try to assign to next in waiting list
                const event = await tx.event.findUnique({
                    where: { id: booking.eventId },
                });

                if (event && event.availableTickets > 0) {
                    // Assign ticket to waiting list user atomically
                    await Promise.all([
                        tx.event.update({
                            where: { id: booking.eventId },
                            data: { availableTickets: { decrement: 1 } },
                        }),
                        tx.booking.create({
                            data: {
                                eventId: booking.eventId,
                                userId: nextInLine.userId,
                                status: BookingStatus.CONFIRMED,
                            },
                        }),
                        tx.waitingList.delete({
                            where: { id: nextInLine.id },
                        }),
                        // Update the waiting booking to confirmed
                        tx.booking.updateMany({
                            where: {
                                eventId: booking.eventId,
                                userId: nextInLine.userId,
                                status: BookingStatus.WAITING,
                            },
                            data: { status: BookingStatus.CONFIRMED },
                        }),
                    ]);

                    assignedTo = nextInLine.userId;
                }
            }

            return {
                success: true,
                cancelledBooking: bookingId,
                assignedToWaitingList: assignedTo,
                message: assignedTo
                    ? `Booking cancelled and ticket assigned to user ${assignedTo}`
                    : 'Booking cancelled successfully',
            };
        });
    }

    async getUserBookings(userId: string): Promise<any[]> {
        const result = await prisma.booking.findMany({
            where: { userId },
            include: {
                event: {
                    select: {
                        name: true,
                        totalTickets: true,
                        availableTickets: true,
                    },
                },
            },
            orderBy: { bookingTime: 'desc' },
        });

        // console.log("result", result, userId);

        return result;
    }

    async getBookingById(bookingId: string): Promise<any | null> {
        return await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { event: true },
        });
    }
}

export default new BookingService();