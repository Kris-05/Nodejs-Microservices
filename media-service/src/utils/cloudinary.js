import { v2 as cloudinary } from 'cloudinary';
import {logger} from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
})

export const uploadMediaToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({
      resource_type : "auto", // detect automatically either img or video
    }, (err, result) => {
      if(err) {
        logger.error(`Error while uplaoding media to cloudinary`);
        reject(err);
      } else {
        resolve(result);
      }
    });

    uploadStream.end(file.buffer);
  });
}

export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info('Media deleted successfully from cloud storage', publicId);
    return result;
  } catch (e) {
    logger.error("Error while deleting media from cloudinary", error);
    throw error;
  }
}