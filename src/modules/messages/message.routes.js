const express = require("express");
const { protect } = require("../../shared/middlewares/auth");
const { validate } = require("../../shared/middlewares/validate");
const { asyncHandler } = require("../../shared/middlewares/asyncHandler");
const {
  listSwapMessagesSchema,
  sendSwapMessageSchema,
} = require("./message.schemas");
const messageController = require("./message.controller");

const router = express.Router();

router.use(protect);

// GET messages for swap
router.get(
  "/swaps/:swapId",
  validate(listSwapMessagesSchema),
  asyncHandler(messageController.listSwapMessages),
);

// POST message to swap
router.post(
  "/swaps/:swapId",
  validate(sendSwapMessageSchema),
  asyncHandler(messageController.sendSwapMessage),
);

module.exports = router;
