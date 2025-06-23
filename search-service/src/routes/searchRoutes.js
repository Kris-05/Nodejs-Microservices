import express from "express";
import { authenthicateUser } from "../middlewares/authMiddleware.js";
import { searchPost } from "../controller/searchController.js";

const router = express.Router();

router.use(authenthicateUser);

router.get('/posts', searchPost);

export default router;