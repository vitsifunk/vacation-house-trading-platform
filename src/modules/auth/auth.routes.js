const express = require("express");
const { asyncHandler } = require("../../shared/middlewares/asyncHandler");
const { validate } = require("../../shared/middlewares/validate");
const { authLimiter } = require("../../shared/middlewares/rateLimiters");
const { registerSchema, loginSchema } = require("./auth.schemas");
const authController = require("./auth.controller");
const { protect } = require("../../shared/middlewares/auth");

const router = express.Router();

// Δημιουργία λογαριασμού
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  asyncHandler(authController.register),
);

// Σύνδεση χρήστη
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
);

// Πληροφορίες τρέχοντος χρήστη (protected)
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      status: "success",
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  }),
);

// Αποσύνδεση (καθαρίζει cookie)
router.post(
  "/logout",
  protect, // προαιρετικό, αλλά καλό να υπάρχει
  asyncHandler(authController.logout),
);

module.exports = router;
