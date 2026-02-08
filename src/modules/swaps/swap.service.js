const mongoose = require("mongoose");
const { AppError } = require("../../shared/errors/AppError");
const { Swap } = require("./swap.model");
const { House } = require("../houses/house.model");
const { createNotification } = require("../notifications/notification.service");
const CANCELLATION_CUTOFF_DAYS = 7;

function rangeIsCoveredByAvailability(house, s, e) {
  return house.availability.some((r) => s >= r.startDate && e <= r.endDate);
}

async function createSwap(requesterId, payload) {
  const {
    requesterHouseId,
    targetHouseId,
    startDate,
    endDate,
    message = "",
  } = payload;

  const s = new Date(startDate);
  const e = new Date(endDate);
  if (s >= e) throw new AppError("startDate must be before endDate", 400);

  // Load houses
  const [requesterHouse, targetHouse] = await Promise.all([
    House.findById(requesterHouseId),
    House.findById(targetHouseId),
  ]);

  if (!requesterHouse) throw new AppError("Requester house not found", 404);
  if (!targetHouse) throw new AppError("Target house not found", 404);

  // ownership checks
  if (String(requesterHouse.owner) !== String(requesterId)) {
    throw new AppError("You can only offer your own house", 403);
  }
  if (String(targetHouse.owner) === String(requesterId)) {
    throw new AppError("You cannot request a swap with your own house", 400);
  }
  if (requesterHouse.status !== "published") {
    throw new AppError("Your house must be published before requesting swaps", 409);
  }
  if (targetHouse.status !== "published") {
    throw new AppError("Target house is not published", 409);
  }

  // availability check on requester house (covers requested range)
  if (!rangeIsCoveredByAvailability(requesterHouse, s, e)) {
    throw new AppError("Your house is not available for the requested dates", 409);
  }

  // availability check on target house (covers requested range)
  if (!rangeIsCoveredByAvailability(targetHouse, s, e)) {
    throw new AppError(
      "Target house is not available for the requested dates",
      409,
    );
  }

  // Optional: prevent duplicate pending requests for same combination & date range
  const duplicate = await Swap.findOne({
    requester: requesterId,
    requesterHouse: requesterHouse._id,
    targetHouse: targetHouse._id,
    startDate: s,
    endDate: e,
    status: "pending",
  });
  if (duplicate)
    throw new AppError("A pending request already exists for these dates", 409);

  const swap = await Swap.create({
    requester: requesterId,
    requesterHouse: requesterHouse._id,
    targetOwner: targetHouse.owner,
    targetHouse: targetHouse._id,
    startDate: s,
    endDate: e,
    message,
  });
  await createNotification({
    user: swap.targetOwner,
    type: "swap_created",
    swap: swap._id,
    title: "New swap request",
    body: "You received a new swap request.",
  });
  return swap;
}

async function listMySwaps(userId) {
  const [sent, received] = await Promise.all([
    Swap.find({ requester: userId })
      .sort("-createdAt")
      .populate("requesterHouse", "title location capacity")
      .populate("targetHouse", "title location capacity")
      .populate("targetOwner", "name"),

    Swap.find({ targetOwner: userId })
      .sort("-createdAt")
      .populate("requester", "name")
      .populate("requesterHouse", "title location capacity")
      .populate("targetHouse", "title location capacity"),
  ]);

  return { sent, received };
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart; // true Î±Î½ Î­Ï‡Î¿Ï…Î½ overlap
}

function subtractRange(availability, s, e) {
  // ÎšÏŒÎ²ÎµÎ¹ Ï„Î¿ [s,e] Î±Ï€ÏŒ Ï„Î± Ï…Ï€Î¬ÏÏ‡Î¿Î½Ï„Î± ranges ÎºÎ±Î¹ ÎµÏ€Î¹ÏƒÏ„ÏÎ­Ï†ÎµÎ¹ Î½Î­Î± Î»Î¯ÏƒÏ„Î± ranges
  const out = [];

  for (const r of availability) {
    const rStart = new Date(r.startDate);
    const rEnd = new Date(r.endDate);

    // no overlap -> ÎºÏÎ±Ï„Î¬Î¼Îµ ÏŒÏ€Ï‰Ï‚ ÎµÎ¯Î½Î±Î¹
    if (!overlaps(s, e, rStart, rEnd)) {
      out.push({ startDate: rStart, endDate: rEnd });
      continue;
    }

    // overlap: Î¼Ï€Î¿ÏÎµÎ¯ Î½Î± Î¼ÎµÎ¯Î½Î¿Ï…Î½ 0, 1 Î® 2 ÎºÎ¿Î¼Î¼Î¬Ï„Î¹Î±
    // Î±ÏÎ¹ÏƒÏ„ÎµÏÏŒ ÎºÎ¿Î¼Î¼Î¬Ï„Î¹
    if (rStart < s) {
      out.push({ startDate: rStart, endDate: s });
    }
    // Î´ÎµÎ¾Î¯ ÎºÎ¿Î¼Î¼Î¬Ï„Î¹
    if (rEnd > e) {
      out.push({ startDate: e, endDate: rEnd });
    }
  }

  // Ï†Î¹Î»Ï„ÏÎ¬ÏÎ¿Ï…Î¼Îµ invalid ranges
  return out.filter((x) => x.startDate < x.endDate);
}

function addRangeAndMerge(availability, s, e) {
  const ranges = [
    ...availability.map((r) => ({
      startDate: new Date(r.startDate),
      endDate: new Date(r.endDate),
    })),
    { startDate: new Date(s), endDate: new Date(e) },
  ].sort((a, b) => a.startDate - b.startDate);

  const merged = [];
  for (const range of ranges) {
    if (!merged.length) {
      merged.push(range);
      continue;
    }

    const last = merged[merged.length - 1];
    if (range.startDate <= last.endDate) {
      if (range.endDate > last.endDate) last.endDate = range.endDate;
    } else {
      merged.push(range);
    }
  }

  return merged.filter((x) => x.startDate < x.endDate);
}

async function acceptSwap(userId, swapId) {
  const existing = await Swap.findById(swapId);
  if (!existing) throw new AppError("Swap not found", 404);
  if (String(existing.targetOwner) !== String(userId))
    throw new AppError("Forbidden", 403);
  if (existing.status !== "pending")
    throw new AppError("Only pending swaps can be accepted", 409);

  const session = await mongoose.startSession();
  let acceptedSwap;

  try {
    await session.withTransaction(async () => {
      const swap = await Swap.findOne({
        _id: swapId,
        targetOwner: userId,
        status: "pending",
      }).session(session);

      if (!swap) {
        throw new AppError("Swap is no longer pending", 409);
      }

      const targetHouse = await House.findById(swap.targetHouse).session(session);
      if (!targetHouse) throw new AppError("Target house not found", 404);

      const s = new Date(swap.startDate);
      const e = new Date(swap.endDate);

      const covered = targetHouse.availability.some(
        (r) => s >= r.startDate && e <= r.endDate,
      );
      if (!covered) {
        throw new AppError("Target house is no longer available for these dates", 409);
      }

      targetHouse.availability = subtractRange(targetHouse.availability, s, e);
      await targetHouse.save({ session });

      swap.status = "accepted";
      swap.respondedAt = new Date();
      await swap.save({ session });

      await Swap.updateMany(
        {
          _id: { $ne: swap._id },
          targetHouse: swap.targetHouse,
          status: "pending",
          startDate: { $lt: e },
          endDate: { $gt: s },
        },
        {
          $set: { status: "rejected", respondedAt: new Date() },
        },
        { session },
      );

      acceptedSwap = swap;
    });
  } finally {
    await session.endSession();
  }

  await createNotification({
    user: acceptedSwap.requester,
    type: "swap_accepted",
    swap: acceptedSwap._id,
    title: "Swap accepted",
    body: "Your swap request was accepted.",
  });

  return acceptedSwap;
}

async function rejectSwap(userId, swapId) {
  const swap = await Swap.findById(swapId);
  if (!swap) throw new AppError("Swap not found", 404);

  if (String(swap.targetOwner) !== String(userId))
    throw new AppError("Forbidden", 403);
  if (swap.status !== "pending")
    throw new AppError("Only pending swaps can be rejected", 409);

  swap.status = "rejected";
  swap.respondedAt = new Date();
  await swap.save();

  // ÎµÎ¹Î´Î¿Ï€Î¿Î¯Î·ÏƒÎ· ÏƒÏ„Î¿Î½ requester
  await createNotification({
    user: swap.requester,
    type: "swap_rejected",
    swap: swap._id,
    title: "Swap rejected",
    body: "Your swap request was rejected.",
  });

  return swap;
}

async function cancelSwap(userId, swapId) {
  const swap = await Swap.findById(swapId);
  if (!swap) throw new AppError("Swap not found", 404);

  const isRequester = String(swap.requester) === String(userId);
  const isTargetOwner = String(swap.targetOwner) === String(userId);
  if (!isRequester && !isTargetOwner) {
    throw new AppError("Only requester or target owner can cancel this swap", 403);
  }

  if (!["pending", "accepted"].includes(swap.status)) {
    throw new AppError("Only pending or accepted swaps can be cancelled", 409);
  }

  if (swap.status === "accepted") {
    const cutoff = new Date(swap.startDate);
    cutoff.setDate(cutoff.getDate() - CANCELLATION_CUTOFF_DAYS);
    if (new Date() > cutoff) {
      throw new AppError(
        `Accepted swaps can only be cancelled at least ${CANCELLATION_CUTOFF_DAYS} days before start date`,
        409,
      );
    }
  }

  const session = await mongoose.startSession();
  let cancelledSwap;

  try {
    await session.withTransaction(async () => {
      const freshSwap = await Swap.findById(swapId).session(session);
      if (!freshSwap) throw new AppError("Swap not found", 404);
      if (!["pending", "accepted"].includes(freshSwap.status)) {
        throw new AppError("Only pending or accepted swaps can be cancelled", 409);
      }

      if (freshSwap.status === "accepted") {
        const targetHouse = await House.findById(freshSwap.targetHouse).session(
          session,
        );
        if (!targetHouse) throw new AppError("Target house not found", 404);

        targetHouse.availability = addRangeAndMerge(
          targetHouse.availability,
          freshSwap.startDate,
          freshSwap.endDate,
        );
        await targetHouse.save({ session });
      }

      freshSwap.status = "cancelled";
      freshSwap.cancelledAt = new Date();
      await freshSwap.save({ session });
      cancelledSwap = freshSwap;
    });
  } finally {
    await session.endSession();
  }

  const otherParty = isRequester ? cancelledSwap.targetOwner : cancelledSwap.requester;
  await createNotification({
    user: otherParty,
    type: "swap_cancelled",
    swap: cancelledSwap._id,
    title: "Swap cancelled",
    body: "A swap was cancelled.",
  });

  return cancelledSwap;
}
module.exports = {
  createSwap,
  listMySwaps,
  acceptSwap,
  rejectSwap,
  cancelSwap,
  // exported for unit tests of critical date-range logic
  __private: {
    rangeIsCoveredByAvailability,
    subtractRange,
    overlaps,
    addRangeAndMerge,
  },
};

