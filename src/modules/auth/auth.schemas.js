const { z } = require("zod");

const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(60),
      email: z.string().email(),
      password: z.string().min(8).max(128),
      confirmPassword: z.string().min(8).max(128),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
  }),
});

module.exports = { registerSchema, loginSchema };
