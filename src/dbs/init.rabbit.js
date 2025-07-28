import amqplib from "amqplib";
import dotenv from "dotenv";
dotenv.config();

export const connectToRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect(process.env.AMQP_URI);
    if (!connection) throw new Error("Connection is not established");

    const channel = await connection.createChannel();
    return { connection, channel };
  } catch (error) {
    console.error(error);
  }
};

export const connectForTest = async () => {
  try {
    const { connection, channel } = await connectToRabbitMQ();

    const queue = "test-queue";
    const message = "test message for rabbitMQ";

    // process message queue
    await channel.assertQueue(queue);
    await channel.sendToQueue(queue, Buffer.from(message));

    // close connection
    await connection.close();
  } catch (error) {
    console.error("Error from RabbitMQ", error);
  }
};

export const consumerQueue = async (channel, queueName) => {
  try {
    await channel.assertQueue(queueName, {
      durable: true /* tiếp tục gửi message khi re-start */,
    });

    console.log("Waiting for messages...");

    channel.consume(
      (queueName, msg) => {
        console.log(`Received message: ${queueName} :`, msg.content.toString());
        // 1. find User folowing that SHOP
        // 2. Send message to user
        // 3. yes, ok --> success
        // 4. error --> setup DLX
      },
      {
        noAck: true, // lỗi, hệ thống xử lý
      }
    );
  } catch (error) {
    console.error("error publish message to rabbitMQ:: ", error);
    throw error;
  }
};
