import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import Redis from "ioredis";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import postRoutes from "./routes/postRoute.js";
import { connectToDB } from "./connections/dbConn.js";
import { connectRabbitMQ } from "./utils/rabbitmq.js";
 
dotenv.config();
const app = express();

const PORT = process.env.PORT || 3002;

// connect to DB & redis server
connectToDB();
const redisClient = new Redis(process.env.REDIS_URL);

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`Request body : ${JSON.stringify(req.body)}`);
  next();
});

// rate limiters for posting, likes, dislikes
const sensitiveLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max : 20,
  standardHeaders : true,
  legacyHeaders : false,
  handler : (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ 
      success: false,
      message: "Too many requests. Try again later."
    });
  },
  store : new RedisStore({
    sendCommand : (...args) => redisClient.call(...args),
  })
});
app.use("/api/posts/create-post", sensitiveLimiter);
app.use("/api/posts/delete-post", sensitiveLimiter);
app.use("/api/posts/:id/like", sensitiveLimiter);
app.use("/api/posts/:id/dislike", sensitiveLimiter);

// Routes -> pass redisClient to the routes
app.use("/api/posts", (req, res, next) => {
  req.redisClient = redisClient;
  next();
}, postRoutes);

// Error handler
app.use(errorHandler);

// Start the server
async function startServer(){
  try {
    await connectRabbitMQ();
    app.listen(PORT, () => {
      logger.info(`Post-Service running on port ${PORT}`);
    });
  } catch (e) {
    logger.error('Failed to connect to Server');
    process.exit(1);
  }
}
startServer();

// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at : ${promise} - reason : ${reason}`);
});
