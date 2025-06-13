import Redis from "ioredis";
const client = new Redis();

async function ioRedisDemo() {
  try {
    await client.set('key', 'value');
    const val = await client.get('key');
    console.log(val);
  } catch(e) {
    console.log(e);
  } finally {
    await client.quit();
  }
}

ioRedisDemo();