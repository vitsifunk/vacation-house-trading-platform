const { z } = require("zod");

const uploadImageSchema = z.object({
  body: z.object({
    file: z
      .string()
      .regex(/^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/, "Invalid image data"),
    filename: z.string().max(180).optional(),
  }),
});

module.exports = { uploadImageSchema };
