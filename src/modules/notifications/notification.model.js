const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "swap_created",
        "swap_accepted",
        "swap_rejected",
        "swap_cancelled",
        "message_received",
      ],
      required: true,
      index: true,
    },

    // ποιο entity αφορά
    swap: { type: mongoose.Schema.Types.ObjectId, ref: "Swap", default: null },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, required: true, maxlength: 500 },

    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
