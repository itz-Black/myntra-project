const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    name: String,
    brand: String,
    price: Number,
    discount: String,
    description: String,
    sizes: [String],
    images: [String],
    // Recommendation fields
    category: { type: String, default: "" },   // e.g. "T-Shirts", "Jackets"
    tags:     { type: [String], default: [] },  // e.g. ["casual", "cotton"]
    color:    { type: String, default: "" },    // e.g. "white", "blue"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
