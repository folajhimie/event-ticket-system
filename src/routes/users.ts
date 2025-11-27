import express from 'express';
import UserController from '../controllers/UserController';
import { generalLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = express.Router();

router.use(generalLimiter);

// Validation schemas
const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(1).max(255).required(),
});

const updateUserSchema = Joi.object({
    email: Joi.string().email().optional(),
    name: Joi.string().min(1).max(255).optional(),
});

// Routes
router.post(
    '/',
    validateRequest(createUserSchema),
    UserController.createUser
);

router.get('/', UserController.getAllUsers);
router.get('/:userId', UserController.getUserById);
router.get('/email/:email', UserController.getUserByEmail);

router.put(
    '/:userId',
    validateRequest(updateUserSchema),
    UserController.updateUser
);

router.delete('/:userId', UserController.deleteUser);

export default router;