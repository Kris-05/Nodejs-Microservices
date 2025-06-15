import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";

import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { connectToDB } from "./connections/dbConn.js";
import authRoutes from "./routes/authRoutes.js";
// import { connectToRedis, redisClient } from "./connections/redisConn.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3001;

// connect to DB & redis server
connectToDB();
const redisClient = new Redis(process.env.REDIS_URL);

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`Request body : ${JSON.stringify(req.body)}`);
  next();
});

// DDos protection & rate limiting using redis
const rateLimiter = new RateLimiterRedis({ //  Creates a rate limiter using Redis as the backend.
  storeClient: redisClient,
  keyPrefix: "middleware", // Prefix for Redis keys to avoid collisions.
  points: 10, // 10 req per sec
  duration: 1,
});
app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip) // Checks and decrements the counter for the IP.
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP : ${req.ip}`);
      res.status(429).json({
        success: false,
        message: "Too many requests",
      });
    });
});

// IP based rate limiting for sensitive endpoints
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true, // Use standard rate limit headers in responses.
  legacyHeaders: false, // Disable old-style headers.
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests",
    });
  },
  store: new RedisStore({ // Use Redis as the backend for storing counters.
    sendCommand: (...args) => redisClient.call(...args),
  }),
});
// use rate limiter to the endpoints
app.use(`/api/auth/register`, sensitiveLimiter);

// Routes
app.use(`/api/auth`, authRoutes);

// Error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  logger.info(`Auth-Service running on port ${PORT}`);
});

// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at : ${promise} - reason : ${reason}`);
});
