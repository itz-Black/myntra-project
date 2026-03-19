const express = require("express");
const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");
const User = require("../models/User");
const router = express.Router();

// ─── GET /product/ ─────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ─── GET /product/recommendations ──────────────────────────────────────────
// Query params:
//   currentProductId  – excluded from results
//   category          – string, same-category products score +3
//   tags              – CSV string,  each tag match adds +1
//   color             – string, color match adds +1
//   userId            – (optional) used to fetch wishlist + history boosts
//
// Response: array of up to 10 products, each with a `badgeType` field
//           ("Similar" | "Recommended" | "Trending")
router.get("/recommendations", async (req, res) => {
  const { currentProductId, category, tags, color, userId } = req.query;
  const inputTags = tags ? tags.split(",").map((t) => t.trim().toLowerCase()) : [];

  try {
    // ── Fetch wishlist product IDs (discounted only) ──────────────────────
    let wishlistProductIds = new Set();
    if (userId) {
      const wishlistItems = await Wishlist.find({ userId }).populate("productId");
      wishlistItems.forEach((item) => {
        if (item.productId && item.productId.discount) {
          wishlistProductIds.add(item.productId._id.toString());
        }
      });
    }

    // ── Fetch user's browsing history product IDs ─────────────────────────
    let historyProductIds = new Set();
    if (userId) {
      const user = await User.findById(userId).select("browsingHistory");
      if (user && user.browsingHistory) {
        user.browsingHistory.forEach((id) => historyProductIds.add(id.toString()));
      }
    }

    // ── Fetch all products (excluding current) ────────────────────────────
    const allProducts = await Product.find(
      currentProductId ? { _id: { $ne: currentProductId } } : {}
    );

    if (allProducts.length === 0) {
      return res.status(200).json([]);
    }

    // ── Score each product ────────────────────────────────────────────────
    const scored = allProducts.map((product) => {
      let score = 0;
      let badgeType = "Trending";

      const pid = product._id.toString();
      const prodTags = (product.tags || []).map((t) => t.toLowerCase());
      const prodColor = (product.color || "").toLowerCase();
      const prodCategory = (product.category || "").toLowerCase();
      const inputCategory = (category || "").toLowerCase();
      const inputColor = (color || "").toLowerCase();

      // Primary: same category (+3)
      if (inputCategory && prodCategory === inputCategory) {
        score += 3;
        badgeType = "Similar";
      }

      // Secondary: wishlisted + discounted (+2)
      if (wishlistProductIds.has(pid)) {
        score += 2;
        badgeType = "Recommended";
      }

      // Tertiary: in browsing history (+1)
      if (historyProductIds.has(pid)) {
        score += 1;
        if (badgeType === "Trending") badgeType = "Recommended";
      }

      // Tag-based similarity (+1 per matching tag)
      if (inputTags.length > 0) {
        const tagMatches = inputTags.filter((t) => prodTags.includes(t)).length;
        score += tagMatches;
        if (tagMatches > 0 && badgeType === "Trending") badgeType = "Similar";
      }

      // Color match (+1)
      if (inputColor && prodColor === inputColor) {
        score += 1;
        if (badgeType === "Trending") badgeType = "Similar";
      }

      return { product, score, badgeType };
    });

    // ── Sort by score descending, then by newest (createdAt) ─────────────
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.product.createdAt) - new Date(a.product.createdAt);
    });

    // ── Return top 10 with badgeType ──────────────────────────────────────
    const top10 = scored.slice(0, 10).map(({ product, badgeType }) => ({
      ...product.toObject(),
      badgeType,
    }));

    res.status(200).json(top10);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ─── GET /product/:id ───────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  const productid = req.params.id;
  try {
    const product = await Product.findById(productid);
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
