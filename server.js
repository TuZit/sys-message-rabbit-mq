import MessageServices from "./src/services/consumerQueue.service.js";

MessageServices.consumerToQueueNormal(process.env.NOTIFICATION_QUEUE)
  .then(console.log("Normal consumer started", process.env.NOTIFICATION_QUEUE))
  .catch((err) => console.log("Message error: ", err));

MessageServices.consumerToQueueFailed()
  .then(
    console.log(
      "Failed consumer started ",
      process.env.NOTIFICATION_EXCHANGE_DLX
    )
  )
  .catch((err) => console.log("Message error: ", err));
