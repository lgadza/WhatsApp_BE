import mongoose from "mongoose";

const { Schema, model } = mongoose;

const MessagesSchema = new Schema(
  {
    sender: { type: String, required: true },
    content: {
      text: { type: String, required: false },
      media: { type: String, required: false },
    },
  },
  { timestamps: true }
);

export default model("Message", MessagesSchema);
