import Media from "../model/media.js";
import mongoose from "mongoose";
import { deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import { logger } from "../utils/logger.js";

export const handlePostDeleted = async(event) => {
  console.log(event, "... event items ...");  

  const { postId, mediaIds } = event;
  try {
    // Filter only valid ObjectIds
    const validMediaIds = mediaIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validMediaIds.length === 0) {
      logger.warn(`No valid mediaIds to delete for postId ${postId}`);
      return;
    }

    // delete from the Cloudinary & Media schema
    const deleteMedias = await Media.find({ _id: { $in: validMediaIds } });

    // sometimes, a post can contain multiple medias
    for(const media of deleteMedias){
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);
      logger.info(`Deleted media ${media._id} associated with this deleted post ${postId}`);
    }

    logger.info(`Processed deletion of media for postId ${postId}`);
  } catch (e) {
    logger.error("Error occured while deleting media", e);
  }
}