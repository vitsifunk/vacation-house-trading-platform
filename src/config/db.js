const mongoose = require("mongoose");
const { env } = require("./env");
const { logger } = require("../shared/logger");

async function connectDB() {
  await mongoose.connect(env.mongoUri);
  logger.info("MongoDB connected");
}

module.exports = { connectDB };
