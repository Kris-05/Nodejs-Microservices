export const inValidatePostCache = async function(req, input) {
  // delete single post cache
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  // delete all posts cache
  const postKeys = await req.redisClient.keys("posts:*");
  if(postKeys.length > 0){
    await req.redisClient.del(postKeys);
  }

  // delete all liked posts cache
  if(req.user && req.user.userId){
    const likedKeys = await req.redisClient.keys(`user:${req.user.userId}:liked`);
    if(likedKeys.length > 0){
      await req.redisClient.del(likedKeys);
    }
  }
}