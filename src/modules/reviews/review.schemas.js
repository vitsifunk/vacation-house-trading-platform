const { z } = require("zod");
const { objectId } = require("../../shared/utils/objectId");

const paginationQuerySchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

const createReviewSchema = z.object({
  body: z.object({
    swapId: objectId,
    revieweeId: objectId,
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
  }),
});

const userReviewsParamSchema = z.object({
  params: z.object({
    userId: objectId,
  }),
  query: paginationQuerySchema.shape.query,
});

module.exports = {
  createReviewSchema,
  paginationQuerySchema,
  userReviewsParamSchema,
};
