const { AppError } = require("./AppError");
const { env } = require("../../config/env");
const { logger } = require("../logger");

function errorHandler(err, req, res, _next) {
  // Expected guest check: frontend may call GET /auth/me without cookie.
  // Keep response as 401 but avoid noisy error-level logs.
  const isExpectedAuthMe401 =
    err instanceof AppError &&
    err.statusCode === 401 &&
    req.method === "GET" &&
    req.path === "/api/v1/auth/me";

  const logPayload = {
    err,
    method: req.method,
    path: req.originalUrl,
  };

  if (isExpectedAuthMe401) {
    logger.warn(logPayload, "Request warning");
  } else {
    logger.error(logPayload, "Request error");
  }

  // Mongoose invalid ObjectId / cast error => 400
  if (err && err.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: "Invalid id format",
    });
  }

  // operational error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Body parser invalid JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: "error",
      message: "Invalid JSON body",
    });
  }

  // dev: show real message for debugging
  if (env.nodeEnv !== "production") {
    return res.status(500).json({
      status: "error",
      message: err.message || "Internal Server Error",
      stack: err.stack,
    });
  }

  // prod: generic
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
}

module.exports = { errorHandler };
