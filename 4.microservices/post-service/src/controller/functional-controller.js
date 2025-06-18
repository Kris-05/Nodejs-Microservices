import {logger} from "../utils/logger.js";
import Post from "../models/post.js";
import Like from "../models/likes.js";
import { inValidatePostCache } from "../utils/cacheValidation.js";

export const allLikedPosts = async (req,res) => {
  logger.info(`Get liked post endpoint hit for user ${req.user.userId}...`);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Cache key
    const cacheKey = `user:${req.user.userId}:liked:${page}:${limit}`;
    const cached = await req.redisClient.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        fromCache: true,
        data: JSON.parse(cached)
      });
    }

    // get all post IDs the user has liked
    const likes = await Like.find({ user: req.user.userId })
      .select('post -_id')
      .skip(startIndex)
      .limit(limit);
    const postIds = likes.map(like => like.post);

    // Get full post details
    const posts = await Post.find({ _id: { $in: postIds } })
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const totalLikes = await Like.countDocuments({ user: req.user.userId });

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalLikes / limit),
      totalLikes
    };

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.status(200).json({
      success: true,
      fromCache: false,
      result
    });
  } catch (e) {
    logger.error(`Error fetching liked posts`, e);
    res.status(500).json({
      success: false,
      message: "Error fetching liked posts"
    });
  }
}

export const likePost = async (req, res) => {
  logger.info(`Like post endpoint hit...`);
  try {
    // get the post
    const post = await Post.findById(req.params.id);
    if(!post){
      logger.error("Post not found");
      return res.status(404).json({ 
        success: false,
        message: "Post not found"
      });
    }

    const liked = await post.addLike(req.user.userId);
    await inValidatePostCache(req, post._id.toString());

    logger.info(liked ? "Post liked" : "Already liked");
    res.status(200).json({
      success : true,
      message : liked ? "Post liked" : "Already liked",
      likeCount : post.likeCount,
    });
  } catch (e) {
    logger.error(`Error Liking Post`, e);
    res.status(500).json({
      success : false,
      message : "Error Liking post"
    });
  }
}

export const dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post){
      logger.error("Post not found");
      return res.status(404).json({ 
        success: false,
        message: "Post not found"
      });
    }

    const unliked = await post.removeLike(req.user.userId);
    await inValidatePostCache(req, post._id.toString());
    
    logger.info(unliked ? "Post liked" : "Already liked");
    res.status(200).json({
      success : true,
      message : unliked ? "Post disliked" : "Already disliked",
      likeCount : post.likeCount,
    });
  } catch (e) {
    logger.error(`Error Disliking Post`, e);
    res.status(500).json({
      success : false,
      message : "Error Disliking post"
    });
  }
}

export const getPostByHashtag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `hashtag:${tag}:${page}:${limit}`;
    const cached = await req.redisClient.get(cacheKey);

    if(cached){
      return res.status(200).json({
        success: true,
        fromCache: true,
        data: JSON.parse(cached)
      });
    }

    const result = await Post.findByHashtag(tag, startIndex, limit);
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    res.status(200).json({
      success: true,
      fromCache: false,
      result
    });
  } catch (e) {
    logger.error(`Error fetching posts by hashtag`, e);
    res.status(500).json({
      success : false,
      message : "Error fetching posts by hashtag"
    });
  }
}