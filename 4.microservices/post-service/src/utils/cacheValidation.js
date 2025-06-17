export const inValidatePostCache = async function(req, ip) {

  const cachedKey = `post:${ip}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*");
  if(keys.length > 0){
    await req.redisClient.del(keys);
  }
}