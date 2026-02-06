const { AppError } = require("../../shared/errors/AppError");
const { signAccessToken } = require("../../shared/utils/tokens");
const { User } = require("../users/user.model");

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError("Email already in use", 409);

  const user = await User.create({ name, email, password });

  const token = signAccessToken({ id: user._id });

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid credentials", 401);

  const ok = await user.comparePassword(password);
  if (!ok) throw new AppError("Invalid credentials", 401);

  const token = signAccessToken({ id: user._id });

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

module.exports = { register, login };
