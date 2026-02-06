const { env } = require("./env");

// Π.χ. στο .env:
// CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
function buildCorsOptions() {
  const raw = env.corsOrigins || "";
  const allowedOrigins = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    origin(origin, cb) {
      // Allow non-browser clients (Postman / curl) χωρίς Origin header
      if (!origin) return cb(null, true);

      // Αν δεν έχεις βάλει CORS_ORIGINS, σε dev επιτρέπουμε όλα (όχι recommended για prod)
      if (allowedOrigins.length === 0 && env.nodeEnv !== "production") {
        return cb(null, true);
      }

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },

    credentials: true, // για cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}

module.exports = { buildCorsOptions };
