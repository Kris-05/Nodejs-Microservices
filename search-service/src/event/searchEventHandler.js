import Search from "../model/search.js";
import { invalidateSearchCache } from "../utils/cacheValidation.js";
import { logger } from "../utils/logger.js";

export const handlePostCreated = async (event, redisClient) => {
  try {
    // console.log(event, "... event ...");
    const newPost = new Search({
      postId : event.postId,
      userId : event.userId,
      content : event.content,
      createdAt : event.createdAt
    });

    await newPost.save();
    await invalidateSearchCache(redisClient);
    
    logger.info(`Search post created : ${event.postId}, ${newPost._id}`);
  } catch (e) {
    logger.error("Error occured while searching post", e);
  }
}

export const handlePostDeleted = async (event, redisClient) => {
  try {
    await Search.findOneAndDelete({ postId : event.postId});
    await invalidateSearchCache(redisClient);

    logger.info(`Search post deleted : ${event.postId}`);
  } catch (e) {
    logger.error("Error occured while deleting post", e);
  }
}