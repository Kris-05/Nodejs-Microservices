import { logger } from "../utils/logger.js";
import { validateRegistration } from "../utils/validate.js";
import User from "../models/user.js";
import { generateTokens } from "../utils/generateToken.js";

// user registration
export const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit...");
  try {
    // validate schema
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Error while validating fields", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // search DB
    const { username, email, password, name, age, mobile } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // register the user
    user = new User({ username, email, password, name, age, mobile });
    await user.save();
    logger.info("User registered successfully", user._id);

    // get the tokens for authentication
    const { accessToken, refreshToken } = await generateTokens(user);
    res.status(201).json({
      success: true,
      message: "User registerd successfully",
      accessToken : accessToken,
      refreshToken : refreshToken,
    });
  } catch (e) {
    logger.error("Error while registering user", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// user login

// refresh token

// logout
