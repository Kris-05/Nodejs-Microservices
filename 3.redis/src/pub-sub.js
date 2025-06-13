import redis from "redis";

const client = redis.createClient({
  host : 'localhost',
  port : 6379 
});

client.on("error", (err) => console.log('REdis client error occured ' + err));

async function additionalFeatures() {
  try {
    // pub-sub
    await client.connect();

    const sub = client.duplicate()  // creates a new client but shares the same conn
    await sub.connect(); // connect subscriber to the server

    await sub.subscribe('chat-channel', (msg, channel) => {
      console.log(`Recieved msg from ${channel}: ${msg}`);
    });

    await client.publish('chat-channel', 'Data from publisher');
    await client.publish('chat-channel', 'New Data from publisher');

    // wait for a second before quitting
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await sub.unsubscribe('chat-channel');
    await sub.quit();

    // transactions
    const multi = client.multi();
    multi.set('transaction1', 'value1');
    multi.set('transaction2', 'value2');
    multi.get('transaction1');
    multi.get('transaction2');

    const res = await multi.exec();
    console.log(res);

    // pipelining
    const pipeline = client.multi();
    for(let i=0; i<1000; i++){
      pipeline.set(`user:${i}:action`, `Action ${i}`);
    }
    await pipeline.exec(); 

    // eg.1
    const transaction = await client.multi();
    transaction.incrBy('account:1234:balance', 100);
    transaction.decrBy('account:4321:balance', 100);
    const finalRes = await transaction.exec();

  } catch (err) {
    console.log(err);
  } finally {
    await client.quit();
  }
}

additionalFeatures();