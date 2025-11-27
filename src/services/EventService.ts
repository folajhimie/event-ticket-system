import { prisma } from '../../src/lib/prisma';
import { BookingStatus } from '../../generated/prisma/client'; // Ensure correct import
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for better type safety
interface Event {
    id: string;
    name: string;
    totalTickets: number;
    availableTickets: number;
    createdAt: Date;
    updatedAt: Date;
}

interface EventStatusResponse {
    eventId: string;
    name: string;
    totalTickets: number;
    availableTickets: number;
    confirmedBookings: number;
    waitingListCount: number;
}

export class EventService {
    async createEvent(name: string, totalTickets: number): Promise<Event> {
        // Validate inputs
        if (!name || name.trim().length === 0) {
            throw new Error('Event name is required');
        }

        if (!totalTickets || totalTickets <= 0) {
            throw new Error('Total tickets must be greater than 0');
        }

        try {
            // Create the event
            return await prisma.event.create({
                data: {
                    id: uuidv4(), 
                    name,
                    totalTickets,
                    availableTickets: totalTickets,
                    createdAt: new Date(), 
                    updatedAt: new Date(), 
                },
            });
        } catch (error) {
            console.error('Error creating event:', error);
            throw new Error('Failed to create event');
        }
    }

    async getEventById(eventId: string): Promise<Event | null> {
        try {
            return await prisma.event.findUnique({
                where: { id: eventId },
            });
        } catch (error) {
            console.error('Error fetching event by ID:', error);
            throw new Error('Failed to fetch event');
        }
    }

    async getAllEvents(): Promise<Event[]> {
        try {
            return await prisma.event.findMany({
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            console.error('Error fetching all events:', error);
            throw new Error('Failed to fetch events');
        }
    }

    async getEventStatus(eventId: string): Promise<EventStatusResponse> {
        try {
            const [event, confirmedBookings, waitingListCount] = await Promise.all([
                prisma.event.findUnique({
                    where: { id: eventId },
                    select: {
                        id: true,
                        name: true,
                        totalTickets: true,
                        availableTickets: true,
                    },
                }),
                prisma.booking.count({
                    where: {
                        eventId,
                        status: BookingStatus.CONFIRMED,
                    },
                }),
                prisma.waitingList.count({
                    where: { eventId },
                }),
            ]);

            if (!event) {
                throw new Error('Event not found');
            }

            return {
                eventId: event.id,
                name: event.name,
                totalTickets: event.totalTickets,
                availableTickets: event.availableTickets,
                confirmedBookings,
                waitingListCount,
            };
        } catch (error) {
            console.error('Error fetching event status:', error);
            throw new Error('Failed to fetch event status');
        }
    }
}

export default new EventService();
