const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    swap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Swap",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1500,
    },
  },
  { timestamps: true },
);

messageSchema.index({ swap: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };
