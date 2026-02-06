const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // soft delete
    active: { type: Boolean, default: true, select: false },
    deletedAt: { type: Date, default: null, select: false },

    password: { type: String, required: true, minlength: 8, select: false },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    bio: { type: String, default: "", maxlength: 400 },
    location: { type: String, default: "", maxlength: 120 },
    avatarUrl: { type: String, default: "" },
  },

  { timestamps: true },
);

// Promise-based middleware (Mongoose 7/8-friendly)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
