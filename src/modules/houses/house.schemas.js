const { z } = require("zod");
const { objectId } = require("../../shared/utils/objectId");
const photoStringSchema = z.string().refine(
  (v) =>
    /^https?:\/\/\S+$/i.test(v) ||
    /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(v),
  "Photo must be a valid image URL or data URL",
);

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
    photos: z.array(photoStringSchema).max(20).optional(),

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

const updateHouseSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z
    .object({
      title: z.string().min(5).max(120).optional(),
      description: z.string().min(20).max(3000).optional(),
      location: z
        .object({
          country: z.string().min(2).max(80).optional(),
          city: z.string().min(2).max(80).optional(),
          address: z.string().min(5).max(200).optional(),
          coordinates: z.tuple([z.number(), z.number()]).optional(),
        })
        .optional(),
      capacity: z.number().int().min(1).max(30).optional(),
      rooms: z.number().int().min(0).max(50).optional(),
      beds: z.number().int().min(0).max(50).optional(),
      baths: z.number().int().min(0).max(50).optional(),
      amenities: z.array(z.string().min(2).max(40)).optional(),
      photos: z.array(photoStringSchema).max(20).optional(),
      availability: z.array(availabilityRangeSchema).min(1).optional(),
      rules: z
        .object({
          petsAllowed: z.boolean().optional(),
          smokingAllowed: z.boolean().optional(),
        })
        .optional(),
      status: z.enum(["draft", "published"]).optional(),
    })
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "At least one field is required",
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
  updateHouseSchema,
  searchHousesSchema,
  houseIdParamSchema,
  addAvailabilitySchema,
};
