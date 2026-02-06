const { z } = require("zod");
const { objectId } = require("../../shared/utils/objectId");

const listNotificationsSchema = z.object({
  query: z.object({
    unreadOnly: z.enum(["true", "false"]).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

const notificationIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

module.exports = { listNotificationsSchema, notificationIdParamSchema };
