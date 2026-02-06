const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    swap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Swap",
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true },
);

reviewSchema.index({ reviewer: 1, swap: 1, reviewee: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

reviewSchema.pre("validate", function () {
  if (
    this.reviewer &&
    this.reviewee &&
    String(this.reviewer) === String(this.reviewee)
  ) {
    this.invalidate("reviewee", "You cannot review yourself");
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = { Review };
