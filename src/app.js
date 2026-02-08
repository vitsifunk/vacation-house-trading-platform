const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");

const { buildCorsOptions } = require("./config/cors");
const { apiLimiter, messageLimiter } = require("./shared/middlewares/rateLimiters");

const routes = require("./routes");
const { errorHandler } = require("./shared/errors/errorHandler");

const app = express();

// Security headers
app.use(helmet());

// CORS (cookie-based auth)
app.use(cors(buildCorsOptions()));

// Rate limiters
app.use("/api", apiLimiter);
app.use("/api/v1/messages", messageLimiter);

// Body + cookies
app.use(express.json({ limit: "12mb" }));
app.use(cookieParser());

// Routes
app.use("/api/v1", routes);

// Errors
app.use(errorHandler);

module.exports = app;
