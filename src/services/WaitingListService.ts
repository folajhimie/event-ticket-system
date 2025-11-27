import { prisma } from '../../src/lib/prisma';
import { WaitingList } from '../../generated/prisma/client';

export class WaitingListService {
    async createWaitingList(eventId: string, userId: string): Promise<WaitingList> {
        if (!eventId || !userId) {
            throw new Error('Event ID and User ID are required');
        }

        // Check if user is already in waiting list for this event
        const existingEntry = await prisma.waitingList.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId,
                },
            },
        });

        if (existingEntry) {
            throw new Error('User is already in waiting list for this event');
        }

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }


        // Check if there are available tickets before creating the waiting list entry
        if (event.availableTickets <= 0) {
            throw new Error('No available tickets for this event');
        }

        // Create waiting list entry
        const waitingListEntry = await prisma.waitingList.create({
            data: {
                eventId,
                userId,
            },
            include: {
                event: {
                    select: {
                        name: true,
                        totalTickets: true,
                        availableTickets: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Deduct available tickets
        await prisma.event.update({
            where: { id: eventId },
            data: {
                availableTickets: event.availableTickets - 1, // Reduce available tickets by 1
            },
        });

        return waitingListEntry;
    }

    async getWaitingListByEventId(eventId: string): Promise<any[]> {
        return await prisma.waitingList.findMany({
            where: { eventId },
            orderBy: { joinedAt: 'asc' },
            include: {
                event: {
                    select: {
                        name: true,
                        totalTickets: true,
                        availableTickets: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async getWaitingListPosition(eventId: string, userId: string): Promise<number> {
        const waitingEntry = await prisma.waitingList.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId,
                },
            },
        });

        if (!waitingEntry) {
            throw new Error('User not found in waiting list');
        }

        const position = await prisma.waitingList.count({
            where: {
                eventId,
                joinedAt: { lte: waitingEntry.joinedAt },
            },
        });

        return position;
    }

    async removeFromWaitingList(waitingId: string): Promise<void> {
        await prisma.waitingList.delete({
            where: { id: waitingId },
        });
    }

    async getUserWaitingListEntries(userId: string): Promise<WaitingList[]> {
        return await prisma.waitingList.findMany({
            where: { userId },
            orderBy: { joinedAt: 'asc' },
            include: {
                event: {
                    select: {
                        name: true,
                        totalTickets: true,
                        availableTickets: true,
                    },
                },
            },
        });
    }

    async getNextInLine(eventId: string): Promise<WaitingList | null> {
        return await prisma.waitingList.findFirst({
            where: { eventId },
            orderBy: { joinedAt: 'asc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async notifyUser(waitingId: string): Promise<WaitingList> {
        return await prisma.waitingList.update({
            where: { id: waitingId },
            data: {
                notifiedAt: new Date(),
            },
            include: {
                event: {
                    select: {
                        name: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async getWaitingListStats(eventId: string): Promise<{
        total: number;
        averageWaitTime: number;
        notifiedCount: number;
    }> {
        const [total, notifiedCount, earliestEntry] = await Promise.all([
            prisma.waitingList.count({ where: { eventId } }),
            prisma.waitingList.count({
                where: {
                    eventId,
                    notifiedAt: { not: null }
                }
            }),
            prisma.waitingList.findFirst({
                where: { eventId },
                orderBy: { joinedAt: 'asc' },
                select: { joinedAt: true },
            }),
        ]);

        let averageWaitTime = 0;
        if (earliestEntry) {
            const waitTime = Date.now() - earliestEntry.joinedAt.getTime();
            averageWaitTime = Math.floor(waitTime / (1000 * 60)); // Convert to minutes
        }

        return {
            total,
            averageWaitTime,
            notifiedCount,
        };
    }
}

export default new WaitingListService();