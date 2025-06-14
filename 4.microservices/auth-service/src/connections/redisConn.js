import Redis from "ioredis";

let redisClient;

export const connectToRedis = async () => {
  try {
    redisClient = new Redis(process.env.REDIS_URL);

    redisClient.on("connect", () => {
      logger.info("Connected to Redis server");
    });
    redisClient.on("error", (err) => {
      logger.error("Redis connection error:", err);
    });

    return redisClient;
  } catch (e) {
    logger.error("Failed to connect to Redis:", e);
    throw e;
  }
};

export { redisClient };
