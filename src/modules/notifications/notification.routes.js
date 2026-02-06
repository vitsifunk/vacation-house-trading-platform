const express = require("express");
const { protect } = require("../../shared/middlewares/auth");
const { validate } = require("../../shared/middlewares/validate");
const { asyncHandler } = require("../../shared/middlewares/asyncHandler");
const {
  listNotificationsSchema,
  notificationIdParamSchema,
} = require("./notification.schemas");
const notificationController = require("./notification.controller");

const router = express.Router();
router.use(protect);

router.get(
  "/",
  validate(listNotificationsSchema),
  asyncHandler(notificationController.list),
);

router.get("/unread-count", asyncHandler(notificationController.unreadCount));

router.patch("/read-all", asyncHandler(notificationController.markAllRead));

router.patch(
  "/:id/read",
  validate(notificationIdParamSchema),
  asyncHandler(notificationController.markRead),
);

module.exports = router;
