const { AppError } = require("./AppError");
const { env } = require("../../config/env");
const { logger } = require("../logger");

function errorHandler(err, req, res, _next) {
  // log ΠΑΝΤΑ (τουλάχιστον σε dev)
  logger.error(
    {
      err,
      method: req.method,
      path: req.originalUrl,
    },
    "Request error",
  );

  // Mongoose invalid ObjectId / cast error => 400
  if (err && err.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: "Invalid id format",
    });
  }

  // αν είναι operational error, το στέλνουμε όπως είναι
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

  // dev: δείξε το πραγματικό error message για να κάνουμε debug
  if (env.nodeEnv !== "production") {
    return res.status(500).json({
      status: "error",
      message: err.message || "Internal Server Error",
      // προαιρετικά:
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
