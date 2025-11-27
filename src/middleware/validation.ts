import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                error: error.details.map(detail => detail.message).join(', ')
            });
            return;
        }
        next();
    };
};

export const initializeEventSchema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    totalTickets: Joi.number().integer().min(1).max(100000).required()
});

export const bookTicketSchema = Joi.object({
    eventId: Joi.string().uuid().required(),
    userId: Joi.string().min(1).max(255).required()
});

export const cancelBookingSchema = Joi.object({
    bookingId: Joi.string().uuid().required()
});