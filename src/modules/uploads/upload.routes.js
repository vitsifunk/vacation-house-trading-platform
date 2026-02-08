const express = require("express");
const { protect } = require("../../shared/middlewares/auth");
const { validate } = require("../../shared/middlewares/validate");
const { asyncHandler } = require("../../shared/middlewares/asyncHandler");
const { uploadImageSchema } = require("./upload.schemas");
const uploadController = require("./upload.controller");

const router = express.Router();

router.post(
  "/image",
  protect,
  validate(uploadImageSchema),
  asyncHandler(uploadController.uploadImage),
);

module.exports = router;
