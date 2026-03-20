/**
 * seed.js - Seeds the local MongoDB with products and categories.
 */

const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");
const Category = require("./models/Category");

const PRODUCTS = [
  {
    name: "Casual White T-Shirt",
    brand: "Roadster",
    price: 499,
    discount: "60% OFF",
    description: "Classic white t-shirt made from premium cotton.",
    sizes: ["S", "M", "L", "XL"],
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop"],
    category: "Men",
    tags: ["casual", "white"],
    color: "white",
  },
  {
    name: "Denim Jacket",
    brand: "Levis",
    price: 2499,
    discount: "40% OFF",
    description: "Classic denim jacket for men.",
    sizes: ["S", "M", "L"],
    images: ["https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop"],
    category: "Men",
    tags: ["denim", "jacket"],
    color: "blue",
  },
  {
    name: "Summer Floral Dress",
    brand: "ONLY",
    price: 1299,
    discount: "50% OFF",
    description: "Flowy summer dress for women.",
    sizes: ["S", "M"],
    images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop"],
    category: "Women",
    tags: ["floral", "dress"],
    color: "multicolor",
  },
  {
    name: "Kids Sneakers",
    brand: "Nike",
    price: 3499,
    discount: "30% OFF",
    description: "Comfortable sneakers for kids.",
    sizes: ["UK6", "UK7"],
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop"],
    category: "Kids",
    tags: ["sneakers", "kids"],
    color: "white",
  },
  {
    name: "Face Serum",
    brand: "Ordinary",
    price: 899,
    discount: "10% OFF",
    description: "Effective skin serum.",
    sizes: ["30ml"],
    images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop"],
    category: "Beauty",
    tags: ["skincare", "serum"],
    color: "clear",
  }
];

const CATEGORIES = [
  {
    name: "Men",
    subcategory: ["T-Shirts", "Shirts", "Jeans", "Jackets"],
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop",
  },
  {
    name: "Women",
    subcategory: ["Dresses", "Tops", "Ethnic Wear"],
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
  },
  {
    name: "Kids",
    subcategory: ["Boys Clothing", "Girls Clothing"],
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop",
  },
  {
    name: "Beauty",
    subcategory: ["Makeup", "Skincare"],
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log("🗑️  Cleared database");

    const insertedProducts = await Product.insertMany(PRODUCTS);
    console.log(`✅ Seeded ${insertedProducts.length} products`);

    const categoriesWithProducts = CATEGORIES.map((cat) => {
      const pId = insertedProducts
        .filter((p) => p.category === cat.name)
        .map((p) => p._id);
        
      return {
        ...cat,
        productId: pId
      };
    });

    await Category.insertMany(categoriesWithProducts);
    console.log(`✅ Seeded ${CATEGORIES.length} categories`);

  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

seed();
