const mongoose = require("mongoose");

const swapSchema = new mongoose.Schema(
  {
    // ποιος κάνει το αίτημα
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // το σπίτι του requester (αυτό που προσφέρει)
    requesterHouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },

    // ο ιδιοκτήτης του target house (αυτόν ζητάει)
    targetOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // το σπίτι που ζητάει
    targetHouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },

    // οι ημερομηνίες που ζητάει να πάει στο target house
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    message: { type: String, trim: true, maxlength: 800, default: "" },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },

    // audit fields
    respondedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Basic sanity check
swapSchema.pre("validate", function () {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    this.invalidate("endDate", "endDate must be after startDate");
  }
});

// Helpful index for inbox queries
swapSchema.index({ targetOwner: 1, status: 1, createdAt: -1 });
swapSchema.index({ requester: 1, status: 1, createdAt: -1 });

const Swap = mongoose.model("Swap", swapSchema);

module.exports = { Swap };
