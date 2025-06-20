export const inValidatePostCache = async function(req, input) {

  // delete single key
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  // delete multiple keys
  const keys = await req.redisClient.keys("posts:*");
  if(keys.length > 0){
    await req.redisClient.del(keys);
  }
}