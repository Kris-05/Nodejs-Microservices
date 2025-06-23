import amqp from "amqplib";
import { logger } from "./logger.js";

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'Social_Media_Events';

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, 'topic', {durable : false});
    logger.info('Connected to RabbitMQ');
    return channel;
  } catch (e) {
    logger.error(`Error connecting to rabbitMQ`, e);
  }
}

async function consumeEvent(routingKey, cb) {
  if(!channel){
    await connectRabbitMQ();
  }

  const q = await channel.assertQueue("", { exclusive : true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
  channel.consume(q.queue, (msg) => {
    const content = JSON.parse(msg.content.toString());
    cb(content);
    channel.ack(msg);
  });

  logger.info(`Subscribed to the event : ${routingKey}`);
}

export { connectRabbitMQ, consumeEvent };