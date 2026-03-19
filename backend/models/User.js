const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    pushToken: {
      type: String,
      default: "",
    },
    notificationPreferences: {
      offers: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      cartReminders: { type: Boolean, default: true },
    },
    browsingHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
