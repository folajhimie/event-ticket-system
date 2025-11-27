import express from 'express';

import WaitingListController from '../controllers/WaitingListController';
import { generalLimiter, bookingLimiter } from '../middleware/rateLimiter';
import { validateRequest, initializeEventSchema, bookTicketSchema, cancelBookingSchema } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(generalLimiter);

router.post('/create-waitlist', bookingLimiter, WaitingListController.createWaitingList);
router.get('/waiting-list/:eventId', WaitingListController.getWaitingList);
router.get('/waiting-list/:userId', WaitingListController.getUserWaitingListEntries);

router.get('/waiting-list/:userId/event/:eventId', WaitingListController.getWaitingListPosition);




export default router;