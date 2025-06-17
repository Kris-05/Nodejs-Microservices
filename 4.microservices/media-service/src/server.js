// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import helmet from "helmet";
// import Redis from "ioredis";

// import { logger } from "./utils/logger.js";
// import { errorHandler } from "./middlewares/errorHandler.js"

// dotenv.config();
// const app = express();

// const PORT = process.env.PORT || 3002;

// // connect to DB & redis server
// connectToDB();
// const redisClient = new Redis(process.env.REDIS_URL);

// // middlewares
// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use((req, res, next) => {
//   logger.info(`Recieved ${req.method} request to ${req.url}`);
//   logger.info(`Request body : ${JSON.stringify(req.body)}`);
//   next();
// });

// // Routes
// app.use('/api/posts', );

// // Error handler
// app.use(errorHandler);

// // Start the server
// app.listen(PORT, () => {
//   logger.info(`Post-Service running on port ${PORT}`);
// });

// // unhandled promise rejection
// process.on("unhandledRejection", (reason, promise) => {
//   logger.error(`Unhandled Rejection at : ${promise} - reason : ${reason}`);
// });
