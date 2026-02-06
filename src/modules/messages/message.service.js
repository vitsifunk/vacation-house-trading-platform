const { AppError } = require("../../shared/errors/AppError");
const { Message } = require("./message.model");
const { Swap } = require("../swaps/swap.model");
const { createNotification } = require("../notifications/notification.service");

async function assertSwapParticipant(swapId, userId) {
  const swap = await Swap.findById(swapId);
  if (!swap) throw new AppError("Swap not found", 404);

  const isRequester = String(swap.requester) === String(userId);
  const isTargetOwner = String(swap.targetOwner) === String(userId);

  if (!isRequester && !isTargetOwner) throw new AppError("Forbidden", 403);

  return swap; // το χρειαζόμαστε για recipient
}

async function listMessages({ swapId, userId, limit = 30, before }) {
  await assertSwapParticipant(swapId, userId);

  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const query = { swap: swapId };
  if (before) query.createdAt = { $lt: new Date(before) };

  const items = await Message.find(query)
    .sort("-createdAt")
    .limit(safeLimit)
    .populate("sender", "name");

  items.reverse(); // chronological για UI
  return { items };
}

async function sendMessage({ swapId, userId, text }) {
  // authorization + παίρνουμε swap για να βρούμε recipient
  const swap = await assertSwapParticipant(swapId, userId);

  const msg = await Message.create({
    swap: swapId,
    sender: userId,
    text,
  });

  await msg.populate("sender", "name");

  // recipient = ο "άλλος" συμμετέχων στο swap
  const recipient =
    String(swap.requester) === String(userId)
      ? swap.targetOwner
      : swap.requester;

  // create notification για τον άλλον
  await createNotification({
    user: recipient,
    type: "message_received",
    swap: swap._id,
    message: msg._id,
    title: "New message",
    body: "You have a new message in a swap conversation.",
  });

  return msg;
}

module.exports = { listMessages, sendMessage };
