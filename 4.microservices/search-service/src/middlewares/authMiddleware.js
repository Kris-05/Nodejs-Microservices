import { logger } from "../utils/logger.js";

export const authenthicateUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];

  if(!userId){
    logger.warn(`Access attempted without userId`);
    return res.status(400).json({
      success : false,
      message : `Authentication required! Pls login to continue`
    });
  }

  req.user = { userId };
  next();
}