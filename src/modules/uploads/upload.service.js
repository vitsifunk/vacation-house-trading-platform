const crypto = require("crypto");
const { AppError } = require("../../shared/errors/AppError");
const { env } = require("../../config/env");

function buildSignatureParams() {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { timestamp };

  if (env.cloudinaryUploadFolder) {
    params.folder = env.cloudinaryUploadFolder;
  }

  const baseString = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(`${baseString}${env.cloudinaryApiSecret}`)
    .digest("hex");

  return { ...params, signature };
}

async function uploadImageToCloudinary(file, filename) {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new AppError("Cloudinary is not configured on server", 500);
  }

  const params = buildSignatureParams();
  const body = new URLSearchParams({
    file,
    api_key: env.cloudinaryApiKey,
    timestamp: String(params.timestamp),
    signature: params.signature,
  });

  if (params.folder) {
    body.set("folder", params.folder);
  }
  if (filename) {
    body.set("filename_override", filename);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`;
  const res = await fetch(endpoint, {
    method: "POST",
    body,
  });

  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    throw new AppError(data?.error?.message || "Cloud upload failed", 502);
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

module.exports = { uploadImageToCloudinary };
