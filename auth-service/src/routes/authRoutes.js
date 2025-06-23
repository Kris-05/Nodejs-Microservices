import express from "express";
import { getRefreshToken, loginUser, logoutUser, registerUser } from "../controller/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refreshToken", getRefreshToken);
router.post("/logout", logoutUser);

export default router;
