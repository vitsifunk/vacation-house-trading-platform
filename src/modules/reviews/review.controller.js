const reviewService = require("./review.service");

async function create(req, res) {
  const review = await reviewService.createReview(req.user._id, req.validated.body);

  res.status(201).json({
    status: "success",
    data: { review },
  });
}

async function myReceived(req, res) {
  const data = await reviewService.listReceived(req.user._id, req.validated.query);
  res.json({ status: "success", data });
}

async function myGiven(req, res) {
  const data = await reviewService.listGiven(req.user._id, req.validated.query);
  res.json({ status: "success", data });
}

async function forUser(req, res) {
  const data = await reviewService.listForUser(req.params.id, req.validated.query);
  res.json({ status: "success", data });
}

module.exports = { create, myReceived, myGiven, forUser };
