import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

export const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    logger.error("Authorization header missing")
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn(`Access attempt without valid token`);
    return res.status(401).json({
      success: false,
      message: `Authentication required`,
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(`Invalid token`);
      return res.status(429).json({
        success: false,
        message: `Invalid token`,
      });
    }
    req.user = user;
  });
  next();
};
