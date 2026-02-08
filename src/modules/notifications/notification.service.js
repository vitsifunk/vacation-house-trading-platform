const { Notification } = require("./notification.model");

async function createNotification(payload) {
  return Notification.create(payload);
}

async function listForUser(userId, { unreadOnly, type, limit = 20, page = 1 }) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);
  const skip = (safePage - 1) * safeLimit;

  const query = { user: userId };
  if (unreadOnly === "true") query.readAt = null;
  if (type) query.type = type;

  const [items, total] = await Promise.all([
    Notification.find(query).sort("-createdAt").skip(skip).limit(safeLimit),
    Notification.countDocuments(query),
  ]);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    pages: Math.ceil(total / safeLimit),
  };
}

async function markRead(userId, notificationId) {
  const n = await Notification.findOne({ _id: notificationId, user: userId });
  if (!n) return null;

  if (!n.readAt) {
    n.readAt = new Date();
    await n.save();
  }

  return n;
}

async function unreadCount(userId, type) {
  const query = {
    user: userId,
    readAt: null,
  };
  if (type) query.type = type;

  const count = await Notification.countDocuments(query);
  return { count };
}

async function markAllRead(userId) {
  const result = await Notification.updateMany(
    { user: userId, readAt: null },
    { $set: { readAt: new Date() } },
  );

  return { modified: result.modifiedCount ?? result.nModified ?? 0 };
}

async function deleteOne(userId, notificationId) {
  const result = await Notification.deleteOne({ _id: notificationId, user: userId });
  return { deleted: result.deletedCount ?? 0 };
}

async function deleteAll(userId) {
  const result = await Notification.deleteMany({ user: userId });
  return { deleted: result.deletedCount ?? 0 };
}

module.exports = {
  createNotification,
  listForUser,
  markRead,
  unreadCount,
  markAllRead,
  deleteOne,
  deleteAll,
};
