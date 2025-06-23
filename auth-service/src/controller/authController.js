import { logger } from "../utils/logger.js";
import { validateLogin, validateRegistration } from "../utils/validate.js";
import User from "../models/user.js";
import { generateTokens } from "../utils/generateToken.js";
import RefreshToken from "../models/refreshToken.js";

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
      accessToken: accessToken,
      refreshToken: refreshToken,
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
export const loginUser = async (req, res) => {
  logger.info(`Login endpoint hit...`);
  try {
    // validate schema
    const { error } = validateLogin(req.body);
    if (error) {
      logger.error("Validation error ", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // search DB
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Invalid credentials or user doesn't exist`);
      return res.status(400).json({
        success: false,
        message: `Invalid credentials or user doesn't exist`,
      });
    }

    // validate password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      logger.warn(`Invalid Password or password doesn't match`);
      return res.status(400).json({
        success: false,
        message: `Invalid Password or password doesn't match`,
      });
    }

    const { accessToken, refreshToken } = await generateTokens(user);
    res.status(200).json({
      success: true,
      userId: user._id,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (e) {
    logger.error("Error while Loging user", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// refresh token
export const getRefreshToken = async (req, res) => {
  logger.info(`Refresh token endpoint hit`);
  try {
    // get refresh token
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn(`Refresh token missing`);
      return res.status(400).json({
        success: false,
        message: `Refresh token missing`,
      });
    }

    // validate the token
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn(`Invalid or expired refresh token`);
      return res.status(400).json({
        success: false,
        message: `Invalid or expired refresh token`,
      });
    }

    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn(`User not found`);
      return res.status(400).json({
        success: false,
        message: `User not found`,
      });
    }

    // create new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);
    // delete the old token
    await RefreshToken.deleteOne({ _id: storedToken._id });
    res.status(200).json({
      newAccessToken,
      newRefreshToken,
    });
  } catch (e) {
    logger.error("Error while getting Refresh token", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// logout
export const logoutUser = async (req, res) => {
  logger.info(`Logout endpoint hit...`);
  try {
    // get refresh token
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn(`Refresh token missing`);
      return res.status(400).json({
        success: false,
        message: `Refresh token missing`,
      });
    }

    // delete the refreshToken from DB
    await RefreshToken.deleteOne({token : refreshToken});
    logger.info(`Refresh token deleted for logout`);
    res.status(200).json({
      success : true,
      message : `Logout successful`,
    });
  } catch (e) {
    logger.error("Error while Loging out", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
