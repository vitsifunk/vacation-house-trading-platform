const { z } = require("zod");
const { objectId } = require("../../shared/utils/objectId");

const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(60).optional(),
    bio: z.string().max(400).optional(),
    location: z.string().max(120).optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

const updatePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(8).max(128),
      newPassword: z.string().min(8).max(128),
      confirmPassword: z.string().min(8).max(128),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

const userIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

module.exports = { updateMeSchema, updatePasswordSchema, userIdParamSchema };
