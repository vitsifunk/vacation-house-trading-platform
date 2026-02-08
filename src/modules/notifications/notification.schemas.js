const { z } = require("zod");
const { objectId } = require("../../shared/utils/objectId");

const listNotificationsSchema = z.object({
  query: z.object({
    unreadOnly: z.enum(["true", "false"]).optional(),
    type: z
      .enum([
        "swap_created",
        "swap_accepted",
        "swap_rejected",
        "swap_cancelled",
        "message_received",
      ])
      .optional(),
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
