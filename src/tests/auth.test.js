const { registerSchema, loginSchema } = require("../modules/auth/auth.schemas");
const { updatePasswordSchema } = require("../modules/users/user.schemas");

describe("auth schemas", () => {
  test("registerSchema accepts matching passwords", () => {
    const result = registerSchema.safeParse({
      body: {
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
        confirmPassword: "password123",
      },
    });

    expect(result.success).toBe(true);
  });

  test("registerSchema rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      body: {
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
        confirmPassword: "password124",
      },
    });

    expect(result.success).toBe(false);
  });

  test("loginSchema rejects short password", () => {
    const result = loginSchema.safeParse({
      body: {
        email: "alice@example.com",
        password: "short",
      },
    });

    expect(result.success).toBe(false);
  });
});

describe("user schemas", () => {
  test("updatePasswordSchema rejects mismatched new/confirm password", () => {
    const result = updatePasswordSchema.safeParse({
      body: {
        currentPassword: "oldpassword123",
        newPassword: "newpassword123",
        confirmPassword: "different123",
      },
    });

    expect(result.success).toBe(false);
  });
});
