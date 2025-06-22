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

    // get from the redis cache
    const cacheKey = `search:${query.trim().toLowerCase()}`;
    const cachedResults = await req.redisClient.get(cacheKey);

    if(cachedResults){
      return res.status(200).json({
        success : true,
        fromCache : true,
        data : JSON.parse(cachedResults)
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

    // store them to the cache for future retrival
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(results));

    logger.info(`Search results count: ${results.length}`);
    res.status(200).json({
      success : true,
      fromCache : false,
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