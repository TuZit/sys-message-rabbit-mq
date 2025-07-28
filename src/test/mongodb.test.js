import mongoose, { Schema, model, connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const testSchema = new Schema({ name: String });
const Test = model("Test", testSchema);

describe("Mongoose Connection", () => {
  let connection;
  beforeAll(async () => {
    connection = await connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await connection.disconnect();
  });

  it("should connect to mongoose", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it("should save a document to the database", async () => {
    const user = new Test({ name: "TuZitt" });
    await user.save();
    expect(user.isNew).toBe(false);
  });

  it("should find a document to the database", async () => {
    const user = await Test.findOne({ name: "TuZitt" });
    expect(user).toBeDefined();
    expect(user.name).toBe("TuZitt");
  });
});
