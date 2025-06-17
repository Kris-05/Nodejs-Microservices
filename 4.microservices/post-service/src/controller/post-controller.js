import Post from "../models/post.js";
import { inValidatePostCache } from "../utils/cacheValidation.js";
import {logger} from "../utils/logger.js";
import { validatePost } from "../utils/validation.js";

// create post
export const createPost = async (req, res) => {
  logger.info(`Create post endpoint hit...`);
  try {
    if(!req.user.userId){
      logger.error(`No access token specified`);
      return res.status(400).json({
        success: false,
        message: `No access token specified`
      }); 
    }

    const { error } = validatePost(req.body);
    if(error){
      logger.error(`Validation error `, error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      }); 
    }

    const { content, mediaIds, hashtags } = req.body;

    // Process Hashtags (extract from content if not provided)
    let processedHashtags = [];
    if (hashtags) {
      processedHashtags = hashtags
        .map(tag => tag.replace(/#/g, '').trim().toLowerCase())
        .filter(tag => tag.length > 0);
    }
    console.log(processedHashtags);

    const newPost = new Post({
      user : req.user.userId,
      content,
      mediaIds : mediaIds || [],
      hashtags : processedHashtags,
    });

    // every time we create a post, delete the stored cache
    await newPost.save();
    await inValidatePostCache(req, newPost._id.toString());

    logger.info("Post created successfully", newPost);
    res.status(201).json({
      success : true,
      message : "Post created successfully",
    })
  } catch (e) {
    logger.error(`Error creating Post`, e);
    res.status(500).json({
      success : false,
      message : "Error creating post"
    })
  }
}

// get all posts
export const getAllPosts = async (req, res) => {
  logger.info(`Get all posts endpoint hit...`);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // get from redis cache
    const cacheKey = `posts:${page}:${limit}`; // unique key for each posts
    const cachedPosts = await req.redisClient.get(cacheKey); // get the cached post

    if(cachedPosts){
      return res.status(200).json({
        success : true,
        fromCache : true,
        data : JSON.parse(cachedPosts),
      })
    }

    const posts = await Post.find({}).sort({ createdAt : -1 }).skip(startIndex).limit(limit);
    const totalPosts = await Post.countDocuments();

    // get all the posts
    const result = {
      posts,
      currentPage : page,
      totalPages : Math.ceil(totalPosts/limit),
      totalPosts,
    }
    // cache it (auto delete from redis after 5min)
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
    res.status(200).json({
      success : true,
      fromCache : false,
      result,
    });
  } catch (e) {
    logger.error(`Error fetching Post`, e);
    res.status(500).json({
      success : false,
      message : "Error fetching Post"
    })
  }
}

// get single post
export const getPost = async (req, res) => {
  logger.info(`Get single post endpoint hit...`);
  try {
    const postId = req.params.id;
    const cacheKey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if(cachedPost){
      return res.status(200).json({
        success : true,
        fromCache : true,
        data : JSON.parse(cachedPost),
      })
    }

    const result = await Post.findById(postId);
    if(!result){
      return res.status(404).json({
        success : false,
        message : `Post not found`,
      })
    }

    // single post will be retrived hardly from user, so set to 1hr
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
    res.status(200).json({
      success : true,
      fromCache : false,
      result,
    });
  } catch (e) {
    logger.error(`Error fetching Post by ID`, e);
    res.status(500).json({
      success : false,
      message : "Error fetching Post by ID"
    })
  }
}

// delete post
export const deletePost = async (req, res) => {
  logger.info(`Delete post endpoint hit...`);
  try {
    if(!req.user || !req.user.userId){
      logger.error("User not authenticated");
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user.userId;
    const post = await Post.findOneAndDelete({
      _id : req.params.id,
      user : userId,
    });

    if(!post){
      res.status(200).json({
        success : false,
        message : `Post not found`
      });
    }

    await inValidatePostCache(req, req.params.id);

    res.status(200).json({
      success : true,
      message : `Post deleted successfully by ${userId}`
    });
  } catch (e) {
    logger.error(`Error deleting Post`, e);
    res.status(500).json({
      success : false,
      message : "Error deleting post"
    })
  }
}
