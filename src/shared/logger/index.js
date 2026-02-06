const pino = require("pino");

const logger =
  process.env.NODE_ENV !== "production"
    ? pino({
        level: process.env.LOG_LEVEL || "info",
        transport: { target: "pino-pretty" },
      })
    : pino({ level: process.env.LOG_LEVEL || "info" });

module.exports = { logger };
