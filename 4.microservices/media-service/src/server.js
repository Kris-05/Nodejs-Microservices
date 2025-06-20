import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

import { connectToDB } from "./connection/dbConn.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js"
import mediaRoutes from "./routes/mediaRoutes.js";
import { connectRabbitMQ, consumeEvent } from "./utils/rabbitmq.js";
import { handlePostDeleted } from "./event/mediaEventHandler.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3003;

// connect to DB
connectToDB();

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`Request body : ${JSON.stringify(req.body)}`);
  next();
});

// rate limiters for uploading

// Routes
app.use('/api/media', mediaRoutes);

// Error handler
app.use(errorHandler);

// Start the server
async function startServer() {
  try {
    await connectRabbitMQ();

    // consume all the events
    await consumeEvent('post.deleted', handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Media-Service running on port ${PORT}`);
    });
  } catch (e) {
    logger.error("Failed to connect to the server", e);
    process.exit(1);
  }
}
startServer();

// unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at : ${promise} - reason : ${reason}`);
});
