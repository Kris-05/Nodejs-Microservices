import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import Redis from "ioredis";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import proxy from "express-http-proxy";

import { errorHandler } from "../src/middleware/errorHandler.js";
import { logger } from "../src/utils/logger.js";
import { validateToken } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// connect to redis
const redisClient = new Redis(process.env.REDIS_URL);

// middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${JSON.stringify(req.body)}`);
  next();
});

// Rate limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});
app.use(rateLimiter);

// create a proxy
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ 
      message : `Internal server error`, error : err.message 
    });
  },
};

// setup proxy for auth-service
app.use('/v1/auth', proxy(process.env.AUTH_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator : (proxyRes, proxyResData, userReq) => {
    logger.info(`Response recieved from Auth-service: ${proxyRes.statusCode}`);
    return proxyResData;
  }
}));

// setup proxy for post-service
app.use('/v1/posts', validateToken, proxy(process.env.POST_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if(!srcReq.user || !srcReq.user.userId){
      logger.error(`User not authenticated, specify access token`);
      throw new Error('User not authenticated, specify access token');
    }

    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    return proxyReqOpts;
  },
  userResDecorator : (proxyRes, proxyResData, userReq) => {
    logger.info(`Response recieved from Post-Service: ${proxyRes.statusCode}`);
    return proxyResData;
  }
}));

// setup proxy for media-service
app.use('/v1/media', validateToken, proxy(process.env.MEDIA_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    const contentType = srcReq.headers['content-type'];
    if (!contentType || !contentType.startsWith('multipart/form-data')) {
      proxyReqOpts.headers["Content-Type"] = "application/json";
    }
    return proxyReqOpts;
  },
  userResDecorator : (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response recieved from Media service : ${proxyRes.statusCode}`);
    return proxyResData;
  },
  parseReqBody : false,
}))

// setup proxy for search-service
app.use('/v1/search', validateToken, proxy(process.env.SEARCH_SERVICE_URL, {
  ...proxyOptions,
  proxyReqOptDecorator : (proxyReqOpts ,srcReq) => {
    proxyReqOpts.headers['Content-Type'] = 'application/json';
    proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;

    return proxyReqOpts;
  },
  userResDecorator : (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response recieved form Search-Service : ${proxyRes.statusCode}`);
    return proxyResData;
  }
}));

// error handlers
app.use(errorHandler);

// start the server
app.listen(PORT, () => {
  logger.info(`API gateway is running on port : ${PORT}`);
  logger.info(`Auth service is running on port : ${process.env.AUTH_SERVICE_URL}`);
  logger.info(`Post service is running on port : ${process.env.POST_SERVICE_URL}`);
  logger.info(`Media service is running on port : ${process.env.MEDIA_SERVICE_URL}`);
  logger.info(`Search service is running on port : ${process.env.SEARCH_SERVICE_URL}`);
  logger.info(`Redis URL : ${process.env.REDIS_URL}`);
});