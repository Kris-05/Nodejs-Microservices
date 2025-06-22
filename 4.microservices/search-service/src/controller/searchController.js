import Search from "../model/search.js";
import { logger } from "../utils/logger.js"

export const searchPost = async (req, res) => {
  logger.info(`Search endpoint hit...`);
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const results = await Search.find(
      { $text : { $search : query } },
      { score : { $meta : 'textScore' } }
    ).sort({score : { $meta : 'textScore' }}).limit(10);

    if(results.length == 0){
      return res.status(404).json({
        success: false,
        message : "No results found for the query"
      });
    }

    logger.info(`Search results count: ${results.length}`);
    res.status(200).json({
      success : true,
      count : results.length,
      data : results
    });
  } catch (e) {
    logger.error("Error while searching post", e);
    res.status(500).json({
      success : false,
      message : "Error while searching post"
    });
  }
}