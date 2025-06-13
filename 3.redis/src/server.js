import redis from "redis";
import { basicOperations, dataStructures } from "./helper.js";

const client = redis.createClient({
  host : 'localhost',
  port : 6379,
});

// event listeners
client.on('error', (err) => console.log('REdis client error occured ' + err));

async function testRedisConn() {
  try {
    await client.connect();
    console.log(`Connected to redis`);

    // await basicOperations(client);
    // await dataStructures(client);

  } catch (err) {
    console.log(err);
  } finally {
    await client.quit();
  }
}

testRedisConn();