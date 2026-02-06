const { z } = require("zod");
const { objectId } = require("../../shared/utils/objectId");

const createSwapSchema = z.object({
  body: z.object({
    requesterHouseId: objectId,
    targetHouseId: objectId,
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    message: z.string().max(800).optional(),
  }),
});

const swapIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

module.exports = { createSwapSchema, swapIdParamSchema };
