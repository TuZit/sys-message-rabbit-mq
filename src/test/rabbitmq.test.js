import { connectForTest } from "../dbs/init.rabbit.js";

describe("RabbitMQ connection", () => {
  it("should connection successfully to rabbitMQ]", async () => {
    const result = await connectForTest();
    expect(result).toBeUndefined();
  });
});
