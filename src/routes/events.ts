import express from 'express';
import EventController from '../controllers/EventController';
import { generalLimiter, bookingLimiter } from '../middleware/rateLimiter';
import { validateRequest, initializeEventSchema, bookTicketSchema, cancelBookingSchema } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(generalLimiter);

router.get('/', EventController.getAllEvents);
router.get('/status/:eventId', EventController.getEventStatus);
// router.get('/waiting-list/:eventId', EventController.getWaitingList);


router.post(
    '/initialize',
    // authenticate,
    validateRequest(initializeEventSchema),
    EventController.initializeEvent
);

router.post(
    '/book',
    // authenticate,
    bookingLimiter,
    validateRequest(bookTicketSchema),
    EventController.bookTicket
);

router.post(
    '/cancel',
    // authenticate,
    validateRequest(cancelBookingSchema),
    EventController.cancelBooking
);

router.get(
    '/user-bookings/:userId', 
    // authenticate, 
    EventController.getUserBookings);

export default router;