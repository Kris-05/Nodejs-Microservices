import Media from "../model/media.js";
import { uploadMediaToCloudinary } from "../utils/cloudinary.js";
import { logger } from "../utils/logger.js"

export const uploadMedia = async (req, res) => {
  logger.info(`Media upload endpoint hit...`);
  try {
    // console.log(req.file, " here's the shit err");
    if(!req.file){
      logger.error(`No file found`);
      return res.status(404).json({
        success : false,
        message : `No file found`
      })
    }

    // get the file details
    const { originalname, mimetype } = req.file;
    const userId = req.user.userId;
    logger.info(`File details : name=${originalname}, type=${mimetype}`);

    // upload to cloudinary
    const uploadRes = await uploadMediaToCloudinary(req.file);
    logger.info(`Cloudinary upload successful - ${uploadRes.public_id}`);

    // save to DB
    const newMedia = new Media({
      publicId : uploadRes.public_id,
      originalName : originalname,
      mimeType : mimetype,
      url : uploadRes.secure_url,
      userId
    });
    await newMedia.save();

    res.status(201).json({
      success : true,
      // mediaId : newMedia.publicId, -> it again gives the same publicID for cloudinary media
      mediaId : newMedia._id,
      url : newMedia.url,
      message : "Media upload successful"
    });
  } catch (e) {
    logger.error(`Error uploading media`, e);
    res.status(500).json({
      success : false,
      message : `Error uploading media`
    });
  }
}

export const getAllMedia = async (req, res) => {
  try {
    const result = await Media.find({});
    res.status(200).json({
      result
    });
  } catch (e) {
    logger.error(`Error fetching media`, e);
    res.status(500).json({
      success : false,
      message : `Error fetching media`
    });
  }
}