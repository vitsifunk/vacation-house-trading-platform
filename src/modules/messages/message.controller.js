const messageService = require("./message.service");

async function listSwapMessages(req, res) {
  const { swapId } = req.params;
  const { limit, before } = req.validated.query;

  const data = await messageService.listMessages({
    swapId,
    userId: req.user._id,
    limit,
    before,
  });

  res.json({ status: "success", data });
}

async function sendSwapMessage(req, res) {
  const { swapId } = req.params;
  const { text } = req.validated.body;

  const message = await messageService.sendMessage({
    swapId,
    userId: req.user._id,
    text,
  });

  res.status(201).json({ status: "success", data: { message } });
}

module.exports = { listSwapMessages, sendSwapMessage };
