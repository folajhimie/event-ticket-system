import rateLimit from 'express-rate-limit';

export const createRateLimiter = (windowMs: number, max: number, message: string) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            error: 'Too many requests',
            message
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

export const generalLimiter = createRateLimiter(
    15 * 60 * 1000, 
    100, 
    'Too many requests from this IP'
);

export const bookingLimiter = createRateLimiter(
    60 * 1000, 
    5, 
    'Too many booking attempts'
);