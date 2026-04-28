const { House } = require("./house.model");
const { AppError } = require("../../shared/errors/AppError");

async function createHouse(ownerId, payload) {
  // payload = validated body
  const doc = {
    owner: ownerId,
    title: payload.title,
    description: payload.description,
    location: {
      country: payload.location.country,
      city: payload.location.city,
      address: payload.location.address,
      geo: payload.location.coordinates
        ? { type: "Point", coordinates: payload.location.coordinates }
        : undefined,
    },
    capacity: payload.capacity,
    rooms: payload.rooms ?? 0,
    beds: payload.beds ?? 0,
    baths: payload.baths ?? 0,
    amenities: payload.amenities ?? [],
    photos: payload.photos ?? [],
    availability: payload.availability.map((r) => ({
      startDate: new Date(r.startDate),
      endDate: new Date(r.endDate),
    })),
    rules: payload.rules ?? undefined,
    status: payload.status ?? "draft",
  };

  const house = await House.create(doc);

  return house;
}

async function getHouseById(id) {
  const house = await House.findOne({ _id: id, status: "published" }).populate(
    "owner",
    "name",
  );
  if (!house) throw new AppError("House not found", 404);
  return house;
}

async function listMyHouses(ownerId) {
  return House.find({ owner: ownerId }).sort("-createdAt");
}

// Για το search, θα θέλαμε να δώσουμε διάφορα φίλτρα και να επιστρέψουμε paginated αποτελέσματα

async function searchHouses(filters) {
  const {
    q,
    country,
    city,
    minCapacity,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = filters;

  const query = { status: "published" };

  // keyword search (text index)
  if (q) query.$text = { $search: q };

  if (country) query["location.country"] = country;
  if (city) query["location.city"] = city;

  if (minCapacity != null) query.capacity = { $gte: minCapacity };

  // Availability: Θέλουμε ένα availability range που να καλύπτει πλήρως το requested range
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);

    query.availability = {
      $elemMatch: {
        startDate: { $lte: s },
        endDate: { $gte: e },
      },
    };
  }

  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const safePage = Math.max(page, 1);
  const skip = (safePage - 1) * safeLimit;

  let mongoQuery = House.find(query)
    .skip(skip)
    .limit(safeLimit)
    .populate("owner", "name");

  // Αν υπάρχει keyword search, δίνουμε προτεραιότητα στο textScore
  if (q) {
    mongoQuery = mongoQuery
      .select({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" }, createdAt: -1 });
  } else {
    mongoQuery = mongoQuery.sort(sort);
  }

  const [items, total] = await Promise.all([
    mongoQuery,
    House.countDocuments(query),
  ]);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    pages: Math.ceil(total / safeLimit),
  };
}

// Bonus: να μπορεί ο owner να προσθέτει availability ranges μετά τη δημιουργία του listing

async function addAvailability(houseId, ownerId, range) {
  const house = await House.findById(houseId);
  if (!house) throw new AppError("House not found", 404);

  // μόνο ο owner μπορεί
  if (String(house.owner) !== String(ownerId)) {
    throw new AppError("Forbidden", 403);
  }

  const s = new Date(range.startDate);
  const e = new Date(range.endDate);
  if (s >= e) throw new AppError("startDate must be before endDate", 400);

  // overlap check: αν (newStart < oldEnd) && (newEnd > oldStart) => overlap
  const overlaps = house.availability.some(
    (r) => s < r.endDate && e > r.startDate,
  );
  if (overlaps) throw new AppError("Availability overlaps existing range", 409);

  house.availability.push({ startDate: s, endDate: e });
  await house.save();

  return house;
}

async function updateHouse(houseId, ownerId, payload) {
  const house = await House.findById(houseId);
  if (!house) throw new AppError("House not found", 404);

  if (String(house.owner) !== String(ownerId)) {
    throw new AppError("Forbidden", 403);
  }

  const scalarFields = [
    "title",
    "description",
    "capacity",
    "rooms",
    "beds",
    "baths",
    "amenities",
    "photos",
    "rules",
    "status",
  ];

  for (const key of scalarFields) {
    if (payload[key] !== undefined) house[key] = payload[key];
  }

  if (payload.location) {
    house.location.country = payload.location.country ?? house.location.country;
    house.location.city = payload.location.city ?? house.location.city;
    house.location.address = payload.location.address ?? house.location.address;

    if (payload.location.coordinates) {
      house.location.geo = {
        type: "Point",
        coordinates: payload.location.coordinates,
      };
    }
  }

  if (payload.availability) {
    house.availability = payload.availability.map((r) => ({
      startDate: new Date(r.startDate),
      endDate: new Date(r.endDate),
    }));
  }

  await house.save();
  return house;
}

async function deleteHouse(houseId, ownerId) {
  const house = await House.findById(houseId);
  if (!house) throw new AppError("House not found", 404);

  if (String(house.owner) !== String(ownerId)) {
    throw new AppError("Forbidden", 403);
  }

  await house.deleteOne();
}

module.exports = {
  createHouse,
  getHouseById,
  listMyHouses,
  updateHouse,
  deleteHouse,
  searchHouses,
  addAvailability,
};
