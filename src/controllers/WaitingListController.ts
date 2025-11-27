import { Request, Response } from 'express';
import WaitingListService  from '../services/WaitingListService';

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

class WaitingListController {
    // Create a new waiting list entry
    async createWaitingList(req: Request, res: Response): Promise<void> {
        try {
            const { eventId, userId } = req.body; // Expecting eventId and userId in the request body

            const newEntry = await WaitingListService.createWaitingList(eventId, userId);
            const response: ApiResponse<typeof newEntry> = {
                success: true,
                data: newEntry,
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

    // Get waiting list by event ID
    async getWaitingList(req: Request, res: Response): Promise<void> {
        try {
            const { eventId } = req.params; // Expecting eventId in the request parameters

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

    // Get user's waiting list entries
    async getUserWaitingListEntries(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params; // Expecting userId in the request parameters

            const entries = await WaitingListService.getUserWaitingListEntries(userId as string);
            const response: ApiResponse<typeof entries> = {
                success: true,
                data: entries,
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

    // Get waiting list position for a user
    async getWaitingListPosition(req: Request, res: Response): Promise<void> {
        try {
            const { eventId, userId } = req.params; 

            const position = await WaitingListService.getWaitingListPosition(eventId as string, userId as string);
            const response: ApiResponse<number> = {
                success: true,
                data: position,
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

    // Remove a user from the waiting list
    async removeFromWaitingList(req: Request, res: Response): Promise<void> {
        try {
            const { waitingId } = req.params; // Expecting waitingId in the request parameters

            await WaitingListService.removeFromWaitingList(waitingId as string);
            const response: ApiResponse<null> = {
                success: true,
            };
            res.status(204).json(response); 
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message,
            };
            res.status(400).json(response);
        }
    }

    // Get the next user in line for an event
    async getNextInLine(req: Request, res: Response): Promise<void> {
        try {
            const { eventId } = req.params; 

            const nextUser = await WaitingListService.getNextInLine(eventId as string);
            const response: ApiResponse<typeof nextUser> = {
                success: true,
                data: nextUser,
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

    // Notify a user
    async notifyUser(req: Request, res: Response): Promise<void> {
        try {
            const { waitingId } = req.params; 

            const notifiedUser = await WaitingListService.notifyUser(waitingId as string);
            const response: ApiResponse<typeof notifiedUser> = {
                success: true,
                data: notifiedUser,
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

    // Get waiting list statistics
    async getWaitingListStats(req: Request, res: Response): Promise<void> {
        try {
            const { eventId } = req.params; // Expecting eventId in the request parameters

            const stats = await WaitingListService.getWaitingListStats(eventId as string);
            const response: ApiResponse<typeof stats> = {
                success: true,
                data: stats,
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
}

export default new WaitingListController();
