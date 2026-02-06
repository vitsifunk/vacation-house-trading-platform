const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { _id: false },
);

const houseSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 3000,
    },

    location: {
      country: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      address: { type: String, trim: true },

      // GeoJSON point (optional for now)
      geo: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [lng, lat]
          default: undefined,
        },
      },
    },

    capacity: { type: Number, required: true, min: 1, max: 30 },
    rooms: { type: Number, min: 0, max: 50, default: 0 },
    beds: { type: Number, min: 0, max: 50, default: 0 },
    baths: { type: Number, min: 0, max: 50, default: 0 },

    amenities: { type: [String], default: [] },
    photos: { type: [String], default: [] },

    availability: { type: [availabilitySchema], default: [] },

    rules: {
      petsAllowed: { type: Boolean, default: false },
      smokingAllowed: { type: Boolean, default: false },
    },

    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true },
);

// Text search (title/description/city/country)
houseSchema.index({
  title: "text",
  description: "text",
  "location.city": "text",
  "location.country": "text",
});

// Geo index (μόνο αν βάλεις coordinates)
houseSchema.index({ "location.geo": "2dsphere" });

// Βασικό sanity check για availability
houseSchema.pre("validate", function () {
  for (const r of this.availability) {
    if (r.startDate >= r.endDate) {
      this.invalidate("availability", "startDate must be before endDate");
      break;
    }
  }
});

const House = mongoose.model("House", houseSchema);

module.exports = { House };
