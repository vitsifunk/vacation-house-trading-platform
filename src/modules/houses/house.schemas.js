const { z } = require("zod");
const { objectId } = require("../../shared/utils/objectId");

const availabilityRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const createHouseSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(120),
    description: z.string().min(20).max(3000),

    location: z.object({
      country: z.string().min(2).max(80),
      city: z.string().min(2).max(80),
      address: z.string().min(5).max(200).optional(),
      // coordinates: [lng, lat]
      coordinates: z.tuple([z.number(), z.number()]).optional(),
    }),

    capacity: z.number().int().min(1).max(30),
    rooms: z.number().int().min(0).max(50).optional(),
    beds: z.number().int().min(0).max(50).optional(),
    baths: z.number().int().min(0).max(50).optional(),

    amenities: z.array(z.string().min(2).max(40)).optional(),
    photos: z.array(z.string().url()).max(20).optional(),

    availability: z.array(availabilityRangeSchema).min(1),

    rules: z
      .object({
        petsAllowed: z.boolean().optional(),
        smokingAllowed: z.boolean().optional(),
      })
      .optional(),

    status: z.enum(["draft", "published"]).optional(),
  }),
});

const searchHousesSchema = z.object({
  query: z.object({
    q: z.string().min(1).max(80).optional(),
    country: z.string().min(2).max(80).optional(),
    city: z.string().min(2).max(80).optional(),

    minCapacity: z
      .string()
      .regex(/^\d+$/)
      .transform((v) => Number(v))
      .optional(),

    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),

    page: z
      .string()
      .regex(/^\d+$/)
      .transform((v) => Number(v))
      .optional(),

    limit: z
      .string()
      .regex(/^\d+$/)
      .transform((v) => Number(v))
      .optional(),

    sort: z.string().max(40).optional(),
  }),
});

const houseIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

const addAvailabilitySchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
});

module.exports = {
  createHouseSchema,
  searchHousesSchema,
  houseIdParamSchema,
  addAvailabilitySchema,
};
