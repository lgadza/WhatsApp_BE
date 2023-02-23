import mongoose from "mongoose";

const { Schema, model } = mongoose;

const chatsSchema = new Schema(
  {
    members: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
    messages: [
      { type: mongoose.Types.ObjectId, required: false, ref: "Message" },
    ],
  },
  { timestamps: true }
);

export default model("Chat", chatsSchema);
