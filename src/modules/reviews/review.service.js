const { AppError } = require("../../shared/errors/AppError");
const mongoose = require("mongoose");
const { Review } = require("./review.model");
const { Swap } = require("../swaps/swap.model");

function buildPagination({ limit = 20, page = 1 }) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);
  const skip = (safePage - 1) * safeLimit;
  return { safeLimit, safePage, skip };
}

async function createReview(reviewerId, payload) {
  const { swapId, revieweeId, rating, comment = "" } = payload;

  const swap = await Swap.findById(swapId);
  if (!swap) throw new AppError("Swap not found", 404);
  if (swap.status !== "accepted") {
    throw new AppError("Reviews are allowed only for accepted swaps", 409);
  }
  if (new Date(swap.endDate) > new Date()) {
    throw new AppError("Reviews are allowed after the swap has ended", 409);
  }

  const isRequester = String(swap.requester) === String(reviewerId);
  const isTargetOwner = String(swap.targetOwner) === String(reviewerId);
  if (!isRequester && !isTargetOwner) {
    throw new AppError("Forbidden", 403);
  }

  const isRevieweeParticipant =
    String(swap.requester) === String(revieweeId) ||
    String(swap.targetOwner) === String(revieweeId);
  if (!isRevieweeParticipant) {
    throw new AppError("Reviewee must be a participant of this swap", 400);
  }
  if (String(revieweeId) === String(reviewerId)) {
    throw new AppError("You cannot review yourself", 400);
  }

  const existing = await Review.findOne({
    reviewer: reviewerId,
    reviewee: revieweeId,
    swap: swapId,
  });
  if (existing) {
    throw new AppError("You already reviewed this user for this swap", 409);
  }

  const review = await Review.create({
    reviewer: reviewerId,
    reviewee: revieweeId,
    swap: swapId,
    rating,
    comment,
  });

  await review.populate("reviewer", "name");
  return review;
}

async function listReceived(userId, query) {
  const { safeLimit, safePage, skip } = buildPagination(query);
  const mongoQuery = { reviewee: userId };
  const revieweeObjectId = new mongoose.Types.ObjectId(String(userId));

  const [items, total, stats] = await Promise.all([
    Review.find(mongoQuery)
      .sort("-createdAt")
      .skip(skip)
      .limit(safeLimit)
      .populate("reviewer", "name")
      .populate("swap", "startDate endDate"),
    Review.countDocuments(mongoQuery),
    Review.aggregate([
      { $match: { reviewee: revieweeObjectId } },
      {
        $group: {
          _id: "$reviewee",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const summary = stats[0]
    ? {
        avgRating: Number(stats[0].avgRating.toFixed(2)),
        count: stats[0].count,
      }
    : { avgRating: 0, count: 0 };

  return {
    items,
    summary,
    page: safePage,
    limit: safeLimit,
    total,
    pages: Math.ceil(total / safeLimit),
  };
}

async function listGiven(userId, query) {
  const { safeLimit, safePage, skip } = buildPagination(query);
  const mongoQuery = { reviewer: userId };

  const [items, total] = await Promise.all([
    Review.find(mongoQuery)
      .sort("-createdAt")
      .skip(skip)
      .limit(safeLimit)
      .populate("reviewee", "name")
      .populate("swap", "startDate endDate"),
    Review.countDocuments(mongoQuery),
  ]);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    pages: Math.ceil(total / safeLimit),
  };
}

async function listForUser(userId, query) {
  return listReceived(userId, query);
}

module.exports = { createReview, listReceived, listGiven, listForUser };
