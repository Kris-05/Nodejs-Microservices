import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

// 1. client sends req to /v1/posts with authorization header
// 2. ValidateToken extracts the token from header & verifies
// 3. If valid it sets the "req.user = user" (which contains the userId & otherinfo)
// 4. in proxyReqOptDecorator, if srcReq.user exist then it sets "x-user-id = srcReq.user.userId"
// 5. proxied req is sent to post service & can identofy the user by "x-user-id" header

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
      message: `Access attempt without valid token! Authentication required`,
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
    next();
  });
};
