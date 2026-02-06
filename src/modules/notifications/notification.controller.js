const notificationService = require("./notification.service");
const { AppError } = require("../../shared/errors/AppError");

async function list(req, res) {
  const data = await notificationService.listForUser(
    req.user._id,
    req.validated.query,
  );

  res.json({ status: "success", data });
}

async function markRead(req, res) {
  const n = await notificationService.markRead(req.user._id, req.params.id);
  if (!n) throw new AppError("Notification not found", 404);

  res.json({ status: "success", data: { notification: n } });
}
async function unreadCount(req, res) {
  const data = await notificationService.unreadCount(req.user._id);
  res.json({ status: "success", data });
}

async function markAllRead(req, res) {
  const data = await notificationService.markAllRead(req.user._id);

  res.json({
    status: "success",
    data,
  });
}

module.exports = { list, markRead, unreadCount, markAllRead };
