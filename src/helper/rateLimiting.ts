import rateLimit from 'express-rate-limit';

export const rateLimiting = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, 
  legacyHeaders: false, 
});