require("dotenv").config();

function must(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  corsOrigins: process.env.CORS_ORIGINS || "",

  mongoUri: must("MONGO_URI"),

  jwtSecret: must("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  logLevel: process.env.LOG_LEVEL || "info",

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  cloudinaryUploadFolder:
    process.env.CLOUDINARY_UPLOAD_FOLDER || "property_swap/houses",
};

module.exports = { env };
