import { connectToRabbitMQ, consumerQueue } from "../dbs/init.rabbit.js";

// import amqplib from "amqplib";
// import dotenv from "dotenv";
// dotenv.config();

class MessageServices {
  async consumerToQueue(queueName) {
    try {
      const { channel } = await connectToRabbitMQ();
      await consumerQueue(channel, queueName);
    } catch (error) {
      console.error(error);
    }
  }

  async consumerToQueueNormal(notifyQueue) {
    try {
      const { channel } = await connectToRabbitMQ();

      const timeExpired = 15000;
      setTimeout(() => {
        channel.consume(
          notifyQueue,
          (msg) => {
            console.log(
              `Normal consumer receive new message: ${msg.content.toString()}`
            );
          },
          {
            noAck: true,
          }
        );
      }, timeExpired);
    } catch (error) {
      console.error(error);
    }
  }

  // Consume DLX queue
  async consumerToQueueFailed() {
    try {
      const { channel } = await connectToRabbitMQ();

      await channel.assertExchange(
        process.env.NOTIFICATION_EXCHANGE_DLX,
        "direct",
        {
          durable: true,
        }
      );

      const { queue } = await channel.assertQueue(
        process.env.NOTIFICATION_QUEUE_HOTFIX,
        {
          exclusive: false,
        }
      );

      await channel.bindQueue(
        queue,
        process.env.NOTIFICATION_EXCHANGE_DLX,
        process.env.NOTIFICATION_ROUTING_KEY_DLX
      );

      await channel.consume(
        queue,
        (message) => {
          console.log(
            `This is failed notification. Please hot fix: ${message.content.toString()}`
          );
        },
        {
          noAck: true,
        }
      );
    } catch (error) {
      console.error(error);
    }
  }
}

export default new MessageServices();
