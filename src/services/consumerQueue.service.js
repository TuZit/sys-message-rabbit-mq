import { connectToRabbitMQ, consumerQueue } from "../dbs/init.rabbit";

class MessageServices {
  async consumerToQueue(queueName) {
    try {
      const { channel } = await connectToRabbitMQ();
      await consumerQueue(channel, queueName);
    } catch (error) {
      console.error(error);
    }
  }
}

export default new MessageServices();
