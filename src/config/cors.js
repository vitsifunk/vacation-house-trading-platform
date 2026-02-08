const { env } = require("./env");

// Example in .env:
// CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
function buildCorsOptions() {
  const raw = env.corsOrigins || "";
  const allowedOrigins = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const isDev = env.nodeEnv !== "production";
  const isLocalDevOrigin = (origin) =>
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

  return {
    origin(origin, cb) {
      // Allow non-browser clients (Postman/curl) without Origin header
      if (!origin) return cb(null, true);

      // If CORS_ORIGINS is empty in development, allow all
      if (allowedOrigins.length === 0 && isDev) {
        return cb(null, true);
      }

      // In development, also allow localhost/127.0.0.1 with any port
      // (helps when Vite auto-switches from 5173 to 5174, etc.)
      if (isDev && isLocalDevOrigin(origin)) {
        return cb(null, true);
      }

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}

module.exports = { buildCorsOptions };
