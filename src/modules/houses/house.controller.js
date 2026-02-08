const houseService = require("./house.service");

async function create(req, res) {
  // req.user έρχεται από protect middleware
  const payload = req.validated.body;

  const house = await houseService.createHouse(req.user._id, payload);

  res.status(201).json({
    status: "success",
    data: {
      house,
    },
  });
}

async function getOne(req, res) {
  const house = await houseService.getHouseById(req.params.id);

  res.json({
    status: "success",
    data: { house },
  });
}

async function my(req, res) {
  const houses = await houseService.listMyHouses(req.user._id);
  res.json({
    status: "success",
    data: { houses },
  });
}

async function list(req, res) {
  const filters = req.validated.query;

  const result = await houseService.searchHouses(filters);

  res.json({
    status: "success",
    data: result,
  });
}

// POST /houses/:id/availability

async function addAvailability(req, res) {
  const houseId = req.params.id;
  const { startDate, endDate } = req.validated.body;

  const house = await houseService.addAvailability(houseId, req.user._id, {
    startDate,
    endDate,
  });

  res.status(200).json({
    status: "success",
    data: { house },
  });
}

async function update(req, res) {
  const house = await houseService.updateHouse(
    req.params.id,
    req.user._id,
    req.validated.body,
  );

  res.json({
    status: "success",
    data: { house },
  });
}

async function remove(req, res) {
  await houseService.deleteHouse(req.params.id, req.user._id);

  res.status(204).send();
}

module.exports = { create, getOne, my, update, remove, list, addAvailability };
