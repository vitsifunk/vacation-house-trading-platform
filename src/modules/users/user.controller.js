const userService = require("./user.service");
const { signAccessToken } = require("../../shared/utils/tokens");
const { accessCookieOptions } = require("../auth/auth.cookies");

function toMeDTO(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    location: user.location,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

async function me(req, res) {
  const user = await userService.getMe(req.user._id);

  res.json({
    status: "success",
    data: { user: toMeDTO(user) },
  });
}

async function updateMe(req, res) {
  const user = await userService.updateMe(req.user._id, req.validated.body);

  res.json({
    status: "success",
    data: { user: toMeDTO(user) },
  });
}

async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.validated.body;

  await userService.updateMyPassword(req.user._id, {
    currentPassword,
    newPassword,
  });

  // προαιρετικό αλλά “σωστό”: νέο token μετά από αλλαγή password
  const token = signAccessToken({ id: req.user._id });
  res.cookie("accessToken", token, accessCookieOptions);

  res.json({
    status: "success",
    message: "Password updated",
  });
}

async function publicProfile(req, res) {
  const user = await userService.getPublicProfile(req.params.id);

  res.json({
    status: "success",
    data: { user },
  });
}

async function deleteMe(req, res) {
  await userService.deactivateMe(req.user._id);

  // καθαρίζουμε cookie => logout
  res.cookie("accessToken", "", {
    ...accessCookieOptions,
    maxAge: 0,
  });

  res.status(204).send();
}

async function publicHouses(req, res) {
  const houses = await userService.getPublicHouses(req.params.id);

  res.json({
    status: "success",
    data: { houses },
  });
}

module.exports = {
  me,
  updateMe,
  updatePassword,
  publicProfile,
  deleteMe,
  publicHouses,
};
