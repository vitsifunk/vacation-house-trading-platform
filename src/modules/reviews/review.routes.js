const express = require("express");
const { protect } = require("../../shared/middlewares/auth");
const { validate } = require("../../shared/middlewares/validate");
const { asyncHandler } = require("../../shared/middlewares/asyncHandler");
const {
  createReviewSchema,
  paginationQuerySchema,
  userReviewsParamSchema,
} = require("./review.schemas");
const reviewController = require("./review.controller");

const router = express.Router();

// Public profile reviews for a user
router.get(
  "/users/:userId",
  validate(userReviewsParamSchema),
  asyncHandler(reviewController.forUser),
);

router.use(protect);

router.post(
  "/",
  validate(createReviewSchema),
  asyncHandler(reviewController.create),
);
router.get(
  "/me/received",
  validate(paginationQuerySchema),
  asyncHandler(reviewController.myReceived),
);
router.get(
  "/me/given",
  validate(paginationQuerySchema),
  asyncHandler(reviewController.myGiven),
);

module.exports = router;
