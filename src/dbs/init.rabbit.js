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
