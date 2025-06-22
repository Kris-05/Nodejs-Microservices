import Search from "../model/search.js";
import { logger } from "../utils/logger.js";

export const handlePostCreated = async (event) => {
  try {
    // console.log(event, "... event ...");
    const newPost = new Search({
      postId : event.postId,
      userId : event.userId,
      content : event.content,
      createdAt : event.createdAt
    });

    await newPost.save();
    logger.info(`Search post created : ${event.postId}, ${newPost._id}`);
  } catch (e) {
    logger.error("Error occured while searching post", e);
  }
}

export const handlePostDeleted = async (event) => {
  try {
    await Search.findOneAndDelete({ postId : event.postId});
    logger.info(`Search post deleted : ${event.postId}`);

  } catch (e) {
    logger.error("Error occured while deleting post", e);
  }
}