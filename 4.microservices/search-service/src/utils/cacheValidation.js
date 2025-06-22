export const invalidateSearchCache = async (redisClient) => {
  const keys= await redisClient.keys('search:*');
  // delete the keys from redis whenever user creates/ deletes a post
  if(keys.length > 0){
    await redisClient.del(keys);
  }
}