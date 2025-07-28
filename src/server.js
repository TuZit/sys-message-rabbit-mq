import MessageServices from "./src/services/consumerQueue.service.js";

const queueName = "test-topic";

MessageServices.consumerToQueue(queueName)
  .then(console.log("Message consumer started ", queueName))
  .catch((err) => console.log("Message error: ", err));
