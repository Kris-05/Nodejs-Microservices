import express from "express";
import { createPost, deletePost, getAllPosts, getPost } from "../controller/post-controller.js";
import { authenthicateUser } from "../middlewares/authMiddleware.js";
import { allLikedPosts, dislikePost, getPostByHashtag, likePost } from "../controller/functional-controller.js";

const router = express.Router();

// to make all routes authenticated
router.use(authenthicateUser);

router.post('/create-post', createPost);
router.get('/get-posts', getAllPosts);
router.get('/get-post/:id', getPost);
router.delete('/delete-post/:id', deletePost);

router.post('/:id/like', likePost);
router.post('/:id/dislike', dislikePost);
router.get('/hashtag/:tag', getPostByHashtag);
router.get('/liked', allLikedPosts);

export default router;