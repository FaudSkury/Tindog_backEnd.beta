const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  ofUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [
    {
      sendBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      sendWhen: Date,
      content: { type: String, required: true },
    },
  ],
});

const conversation = mongoose.model("conversation", conversationSchema);

module.exports = conversation;
