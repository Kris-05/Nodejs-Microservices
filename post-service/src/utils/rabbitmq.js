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

async function publishEvent(routingKey, msg) {
  if(!channel){
    await connectRabbitMQ();
  }
  channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(msg)));
  logger.info(`Event published: ${routingKey}`);
}

export { connectRabbitMQ, publishEvent };