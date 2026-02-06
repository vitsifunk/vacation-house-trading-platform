const swapService = require("./swap.service");

async function create(req, res) {
  const swap = await swapService.createSwap(req.user._id, req.validated.body);

  res.status(201).json({
    status: "success",
    data: { swap },
  });
}

async function my(req, res) {
  const data = await swapService.listMySwaps(req.user._id);

  res.json({
    status: "success",
    data,
  });
}

async function accept(req, res) {
  const swap = await swapService.acceptSwap(req.user._id, req.params.id);

  res.json({ status: "success", data: { swap } });
}

async function reject(req, res) {
  const swap = await swapService.rejectSwap(req.user._id, req.params.id);

  res.json({ status: "success", data: { swap } });
}

async function cancel(req, res) {
  const swap = await swapService.cancelSwap(req.user._id, req.params.id);

  res.json({ status: "success", data: { swap } });
}

module.exports = { create, my, accept, reject, cancel };
