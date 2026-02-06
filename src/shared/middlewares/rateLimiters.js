const rateLimit = require("express-rate-limit");

// Γενικό rate limiter για όλο το API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 λεπτά
  max: 300, // αρκετά generous για dev
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

// Πιο αυστηρό limiter για login/register (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many auth attempts, please try again later.",
});

// Αν έχεις endpoints για messages μπορείς να έχεις ξεχωριστό limiter (optional)
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 λεπτό
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many messages, slow down.",
});

module.exports = { apiLimiter, authLimiter, messageLimiter };
