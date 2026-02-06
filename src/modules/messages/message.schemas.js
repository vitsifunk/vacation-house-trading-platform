const { z } = require("zod");
const { objectId } = require("../../shared/utils/objectId");

const listSwapMessagesSchema = z.object({
  params: z.object({
    swapId: objectId,
  }),
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    before: z.string().datetime().optional(), // pagination by time (optional)
  }),
});

const sendSwapMessageSchema = z.object({
  params: z.object({
    swapId: objectId,
  }),
  body: z.object({
    text: z.string().min(1).max(1500),
  }),
});

module.exports = { listSwapMessagesSchema, sendSwapMessageSchema };
