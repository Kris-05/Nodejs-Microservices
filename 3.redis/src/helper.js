export const basicOperations = async (client) => {
  await client.set("name", "krisna");
  const val = await client.get("name");
  console.log(val);

  const delCount = await client.del("name");
  console.log(delCount);

  await client.set('count', 100);
  const incr = await client.incr("count");
  console.log(incr);
  
  await client.decr('count');
  console.log(await client.get('count'));
}

export const dataStructures = async (client) => {
  // Strings -> SET, GET, MSET, MGET
  await client.set("user:name", "Krisna");
  const name = await client.get("user:name");
  console.log(name);
  
  await client.mSet(["user:email", "kris@gmail.com", "user:age", "21", "user:country", "India"]);
  const [email, age, country] = await client.mGet(["user:email", "user:age", "user:country"])
  console.log(email, age, country);
  
  // List -> LPUSH, RPUSH, LRANGE, LPOP, RPOP
  await client.lPush('notes', ['note 1', 'note 2', 'note 3']);
  const allNodes = await client.lRange('notes', 0, -1);
  console.log(allNodes);
  
  const firstNote = await client.lPop('notes');
  console.log(firstNote);
  
  // Sets -> SADD, SMEMBERS, SISMEMBER, SREM
  await client.sAdd('user:nickName', ['alpha', 'beta', 'gamma']);
  const userNicknames = await client.sMembers('user:nickName');
  console.log(userNicknames);
  
  const checkMember = await client.sIsMember('user:nickName', 'alpha');

  await client.sRem("user:nickName", 'gamma');
  console.log(await client.sMembers('user:nickName'));

  // Sorted sets -> each element has score associated with it
  // ZRANGE, ZADD, ZRANK, ZREM
  await client.zAdd('cart', [
    { score : 100, value : 'Cart 1'},
    { score : 150, value : 'Cart 2'},
    { score : 10, value : 'Cart 3'},
    { score : 200, value : 'Cart 4'},
  ]);
  const getTopItems = await client.zRange('cart', 0, -1);
  const withScore = await client.zRangeWithScores('cart', 0, -1);
  console.log(getTopItems, withScore);
  const itemRank = await client.zRank('cart', 'Cart 2');
  console.log(itemRank);

  // Hashmap -> HSET, HGET, HGETALL, HDEL
  await client.hSet('product:1', {name:'Product 1', description: 'sample', rating: '1'});
  const getRating = await client.hGet('product:1', 'description');
  console.log(getRating);
  await client.hDel('product:1', 'rating');
  const allDetails = await client.hGetAll('product:1');
  console.log(allDetails); 
}