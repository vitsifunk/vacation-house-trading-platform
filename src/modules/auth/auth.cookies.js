const { env } = require("../../config/env");

const isProd = env.nodeEnv === "production";

const accessCookieOptions = {
  httpOnly: true,
  secure: isProd, // true μόνο σε https (production)
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60 * 1000, // 15 λεπτά
};

module.exports = { accessCookieOptions };
