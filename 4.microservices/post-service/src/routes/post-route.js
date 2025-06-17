import express from "express";
import { createPost, deletePost, getAllPosts, getPost } from "../controller/post-controller.js";
import { authenthicateUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

// to make all routes authenticated
// router.use(authenthicateUser);

router.post('/create-post', authenthicateUser, createPost);
router.get('/get-posts', authenthicateUser, getAllPosts);
router.get('/get-post/:id', authenthicateUser, getPost);
router.delete('/delete-post/:id',authenthicateUser, deletePost);

export default router;