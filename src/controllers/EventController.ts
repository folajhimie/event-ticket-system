import { Request, Response } from 'express';
import EventService from '../services/EventService';
import BookingService from '../services/BookingService';
import WaitingListService from '../services/WaitingListService';
import { ApiResponse } from '../types';

export class EventController {
    async initializeEvent(req: Request, res: Response): Promise<void> {
        try {
            const { name, totalTickets } = req.body;

            const event = await EventService.createEvent(name, totalTickets);

            const response: ApiResponse<typeof event> = {
                success: true,
                data: event,
            };
            res.status(201).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(400).json(response);
        }
    }

    async bookTicket(req: Request, res: Response): Promise<void> {
        try {
            const { eventId, userId } = req.body;

            const result = await BookingService.createBooking(eventId, userId);

            const response: ApiResponse<typeof result> = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(400).json(response);
        }
    }

    async cancelBooking(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId } = req.body;

            const result = await BookingService.cancelBooking(bookingId);

            const response: ApiResponse<typeof result> = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(400).json(response);
        }
    }

    async getEventStatus(req: Request, res: Response): Promise<void> {
        try {
            const { eventId } = req.params;

            const result = await EventService.getEventStatus(eventId as string);

            const response: ApiResponse<typeof result> = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(400).json(response);
        }
    }

    async getWaitingList(req: Request, res: Response): Promise<void> {
        try {
            const { eventId } = req.params;

            const result = await WaitingListService.getWaitingListByEventId(eventId as string);

            const response: ApiResponse<typeof result> = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(400).json(response);
        }
    }

    async getUserBookings(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            const result = await BookingService.getUserBookings(userId as string);
            // console.log("booking ..", result);

            const response: ApiResponse<typeof result> = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(400).json(response);
        }
    }

    async getAllEvents(req: Request, res: Response): Promise<void> {
        try {
            const result = await EventService.getAllEvents();

            const response: ApiResponse<typeof result> = {
                success: true,
                data: result,
            };
            res.status(200).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(500).json(response);
        }
    }
}

export default new EventController();