const app = require("./app");
const { connectDB } = require("./config/db");
const { env } = require("./config/env");
const { logger } = require("./shared/logger");

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    logger.info(`API running on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
