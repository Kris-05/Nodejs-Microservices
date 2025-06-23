import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to mongoDB");
  } catch (e) {
    logger.error("mongoDB connection failed", e)
    process.exit(1); 
  }
}