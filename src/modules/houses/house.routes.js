const express = require("express");
const { protect } = require("../../shared/middlewares/auth");
const { validate } = require("../../shared/middlewares/validate");
const { asyncHandler } = require("../../shared/middlewares/asyncHandler");

const {
  createHouseSchema,
  updateHouseSchema,
  searchHousesSchema,
  houseIdParamSchema,
  addAvailabilitySchema,
} = require("./house.schemas");

const houseController = require("./house.controller");

const router = express.Router();

// Search / list (public)
router.get(
  "/",
  validate(searchHousesSchema),
  asyncHandler(houseController.list),
);

// Create listing (logged in)
router.post(
  "/",
  protect,
  validate(createHouseSchema),
  asyncHandler(houseController.create),
);

// My houses (logged in)
router.get("/mine", protect, asyncHandler(houseController.my));

// Update listing (logged in, owner only)
router.patch(
  "/:id",
  protect,
  validate(updateHouseSchema),
  asyncHandler(houseController.update),
);

// Delete listing (logged in, owner only)
router.delete(
  "/:id",
  protect,
  validate(houseIdParamSchema),
  asyncHandler(houseController.remove),
);

// Add availability (logged in, owner only)
router.post(
  "/:id/availability",
  protect,
  validate(addAvailabilitySchema),
  asyncHandler(houseController.addAvailability),
);

// Get by id (public) με validate
router.get(
  "/:id",
  validate(houseIdParamSchema),
  asyncHandler(houseController.getOne),
);

module.exports = router;
