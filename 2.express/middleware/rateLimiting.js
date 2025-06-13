import rateLimit from "express-rate-limit";

export const basicRateLimiter = (maxRequests, duration) => {
  return rateLimit({
    max : maxRequests,
    windowMs : duration,
    message : 'Too many requests, pls try again later',
    standardHeaders : true,
    legacyHeaders : false
  });
}