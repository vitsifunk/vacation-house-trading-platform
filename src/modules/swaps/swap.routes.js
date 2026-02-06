const express = require("express");
const { protect } = require("../../shared/middlewares/auth");
const { validate } = require("../../shared/middlewares/validate");
const { asyncHandler } = require("../../shared/middlewares/asyncHandler");
const { createSwapSchema, swapIdParamSchema } = require("./swap.schemas");
const swapController = require("./swap.controller");

const router = express.Router();

router.use(protect);

// create swap
router.post(
  "/",
  validate(createSwapSchema),
  asyncHandler(swapController.create),
);

// my inbox/outbox
router.get("/my", asyncHandler(swapController.my));

// actions
router.patch(
  "/:id/accept",
  validate(swapIdParamSchema),
  asyncHandler(swapController.accept),
);
router.patch(
  "/:id/reject",
  validate(swapIdParamSchema),
  asyncHandler(swapController.reject),
);
router.patch(
  "/:id/cancel",
  validate(swapIdParamSchema),
  asyncHandler(swapController.cancel),
);

module.exports = router;
