const express = require("express");

const authRoutes = require("../modules/auth/auth.routes");
const houseRoutes = require("../modules/houses/house.routes");
const swapRoutes = require("../modules/swaps/swap.routes");
const messageRoutes = require("../modules/messages/message.routes");
const notificationRoutes = require("../modules/notifications/notification.routes");
const userRoutes = require("../modules/users/user.routes");
const reviewRoutes = require("../modules/reviews/review.routes");
const uploadRoutes = require("../modules/uploads/upload.routes");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ name: "Vacation Swap API", version: "v1" });
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/houses", houseRoutes);
router.use("/swaps", swapRoutes);
router.use("/messages", messageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reviews", reviewRoutes);
router.use("/uploads", uploadRoutes);

module.exports = router;
