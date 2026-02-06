const express = require("express");
const { protect } = require("../../shared/middlewares/auth");
const { validate } = require("../../shared/middlewares/validate");
const { asyncHandler } = require("../../shared/middlewares/asyncHandler");
const {
  updateMeSchema,
  updatePasswordSchema,
  userIdParamSchema,
} = require("./user.schemas");
const userController = require("./user.controller");

const router = express.Router();

router.get("/me", protect, asyncHandler(userController.me));
router.patch(
  "/me",
  protect,
  validate(updateMeSchema),
  asyncHandler(userController.updateMe),
);
router.patch(
  "/me/password",
  protect,
  validate(updatePasswordSchema),
  asyncHandler(userController.updatePassword),
);

router.delete("/me", protect, asyncHandler(userController.deleteMe));
router.get(
  "/:id/houses",
  validate(userIdParamSchema),
  asyncHandler(userController.publicHouses),
);

// public profile
router.get(
  "/:id",
  validate(userIdParamSchema),
  asyncHandler(userController.publicProfile),
);

module.exports = router;
