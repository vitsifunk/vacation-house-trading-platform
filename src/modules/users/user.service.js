const { AppError } = require("../../shared/errors/AppError");
const { User } = require("./user.model");
const { House } = require("../houses/house.model");

async function deactivateMe(userId) {
  const user = await User.findById(userId).select("+active");
  if (!user) throw new AppError("User not found", 404);

  user.active = false;
  user.deletedAt = new Date();
  await user.save();

  // optional (καλό product behavior): κρύβουμε τα σπίτια του
  await House.updateMany({ owner: userId }, { $set: { status: "draft" } });

  return true;
}

// allowlist για να μη μπορεί να αλλάξει role/email/password από /me
function pickAllowed(input, allowed) {
  const out = {};
  for (const key of allowed) {
    if (input[key] !== undefined) out[key] = input[key];
  }
  return out;
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
}

async function updateMe(userId, payload) {
  const allowed = pickAllowed(payload, [
    "name",
    "bio",
    "location",
    "avatarUrl",
  ]);

  const user = await User.findByIdAndUpdate(userId, allowed, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new AppError("User not found", 404);
  return user;
}

async function updateMyPassword(userId, { currentPassword, newPassword }) {
  // θέλουμε password => select +password
  const user = await User.findById(userId).select("+password");
  if (!user) throw new AppError("User not found", 404);

  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw new AppError("Current password is incorrect", 401);

  user.password = newPassword; // θα γίνει hash από pre('save')
  await user.save();

  return true;
}

async function getPublicProfile(userId) {
  const user = await User.findById(userId).select(
    "name bio location avatarUrl createdAt",
  );
  if (!user) throw new AppError("User not found", 404);
  return user;
}

async function getPublicHouses(userId) {
  // public: μόνο published
  const houses = await House.find({ owner: userId, status: "published" })
    .sort("-createdAt")
    .select(
      "title location capacity rooms beds baths amenities photos availability rules status createdAt",
    );

  return houses;
}

module.exports = {
  getMe,
  updateMe,
  updateMyPassword,
  getPublicProfile,
  deactivateMe,
  getPublicHouses,
};
