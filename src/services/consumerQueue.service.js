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

      // Giả lập lỗi TTL
      // const timeExpired = 15000;
      // setTimeout(() => {
      //   channel.consume(
      //     notifyQueue,
      //     (msg) => {
      //       console.log(
      //         `Normal consumer receive new message: ${msg.content.toString()}`
      //       );
      //     },
      //     {
      //       noAck: true,
      //     }
      //   );
      // }, timeExpired);

      // Giả lập lỗi logic
      channel.consume(notifyQueue, (msg) => {
        try {
          const numberTest = Math.random();

          if (numberTest < 0.8) {
            console.log({ numberTest });
            throw new Error("Send notification failed:: HOT FIX");
          }

          console.log(
            "SEND notificationQueue sucessfully processed:",
            msg.content.toString()
          );
          channel.ack(msg);
        } catch (error) {
          // console.error(error);
          /**
           * báo với RabbitMQ rằng một consumer không xử lý được một message.
           * neck: có nhiệm vụ nếu có lỗi sẽ push cái message vào cái queue hứng lỗi
           */
          channel.nack(msg, false, false);
        }
      });
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

/**
 * Trong RabbitMQ, channel.nack(msg, requeue, multiple) là một phương thức
 * để báo với RabbitMQ rằng một consumer không xử lý được một message. Nó là viết tắt của "negative acknowledgement".
 * msg: Là message mà consumer muốn nack.
 * requeue: Nếu là true, message sẽ được đưa trở lại queue và có thể được deliver cho một consumer khác (hoặc chính consumer này).
 * Nếu là false, message sẽ bị loại bỏ hoặc chuyển đến một Dead Letter Exchange (DLX) nếu nó được cấu hình.
 * multiple: Nếu là true, nó báo hiệu rằng consumer từ chối tất cả các message chưa được acknowledged cho đến message hiện tại.
 * Điều này chỉ nên được sử dụng nếu bạn chắc chắn rằng tất cả các message trước đó cũng không thể xử lý được.
 * Nếu là false, nó chỉ từ chối message hiện tại.
 * Trong đoạn code trên, channel.nack(msg, false, false) có nghĩa là:
 * Consumer báo với RabbitMQ rằng nó không thể xử lý message msg.
 * Message msg sẽ không được đưa trở lại queue (requeue = false).
 * Thay vào đó, nó sẽ bị loại bỏ hoặc chuyển đến DLX nếu có.
 * Chỉ có message msg bị từ chối (multiple = false).
 */
