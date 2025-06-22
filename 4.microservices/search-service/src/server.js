import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import Redis from "ioredis";

import { connectToDB } from "./connection/dbConn.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { connectRabbitMQ, consumeEvent } from "./utils/rabbitmq.js";
import searchRoute from "./routes/searchRoutes.js";
import { handlePostCreated, handlePostDeleted } from "./event/searchEventHandler.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3004;

// connect to DB & Redis
connectToDB();
const redisClient = new Redis(process.env.REDIS_URL)

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`Request body : ${JSON.stringify(req.body)}`);
  next();
});

// redis cache for routes
app.use('/api/search', (req, res, next) => {
  req.redisClient = redisClient;
  next();
}, searchRoute);

// error handler
app.use(errorHandler);

// start the server
async function startServer(){
  try {
    await connectRabbitMQ();

    // consume / subscribe to the event
    await consumeEvent('post.created', (event) => handlePostCreated(event, redisClient));
    await consumeEvent('post.deleted', (event) => handlePostDeleted(event, redisClient));

    app.listen(PORT, () => {
      logger.info(`Search-Service running on port ${PORT}`)
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