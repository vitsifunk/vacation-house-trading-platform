const { z } = require("zod");

// 24-hex MongoDB ObjectId
const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id format");

module.exports = { objectId };
