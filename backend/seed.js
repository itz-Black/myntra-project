/**
 * seed.js - Seeds the local MongoDB with sample products
 * that include category, tags, and color fields for recommendation testing.
 *
 * Run: node seed.js   (from the backend/ directory)
 */

const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const PRODUCTS = [
  {
    name: "Casual White T-Shirt",
    brand: "Roadster",
    price: 499,
    discount: "60% OFF",
    description: "Classic white t-shirt made from premium cotton. Perfect for everyday wear.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&auto=format&fit=crop",
    ],
    category: "T-Shirts",
    tags: ["casual", "cotton", "summer", "white"],
    color: "white",
  },
  {
    name: "Classic Striped T-Shirt",
    brand: "H&M",
    price: 399,
    discount: "50% OFF",
    description: "Comfortable striped tee for everyday casual wear.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop",
    ],
    category: "T-Shirts",
    tags: ["casual", "striped", "cotton"],
    color: "blue",
  },
  {
    name: "Graphic Print T-Shirt",
    brand: "Bewakoof",
    price: 349,
    discount: "40% OFF",
    description: "Fun graphic print tee — wear your personality.",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop",
    ],
    category: "T-Shirts",
    tags: ["graphic", "casual", "printed"],
    color: "black",
  },
  {
    name: "Oversized Drop-Shoulder Tee",
    brand: "Campus Sutra",
    price: 699,
    discount: "35% OFF",
    description: "Trendy oversized drop-shoulder t-shirt for a relaxed look.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop",
    ],
    category: "T-Shirts",
    tags: ["oversized", "cotton", "casual", "trendy"],
    color: "grey",
  },
  {
    name: "Cotton Polo T-Shirt",
    brand: "U.S. Polo Assn.",
    price: 899,
    discount: "30% OFF",
    description: "Classic polo collar t-shirt, perfect for semi-formal occasions.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop",
    ],
    category: "T-Shirts",
    tags: ["polo", "cotton", "formal", "premium"],
    color: "navy",
  },
  {
    name: "Denim Jacket",
    brand: "Levis",
    price: 2499,
    discount: "40% OFF",
    description: "Classic denim jacket with a modern twist. Features premium quality denim and comfortable fit.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop",
    ],
    category: "Jackets",
    tags: ["denim", "jacket", "casual", "blue"],
    color: "blue",
  },
  {
    name: "Leather Biker Jacket",
    brand: "Roadster",
    price: 3999,
    discount: "25% OFF",
    description: "Premium faux leather biker jacket for a bold statement.",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop",
    ],
    category: "Jackets",
    tags: ["leather", "biker", "bold", "black"],
    color: "black",
  },
  {
    name: "Summer Floral Dress",
    brand: "ONLY",
    price: 1299,
    discount: "50% OFF",
    description: "Flowy summer dress perfect for warm weather. Made from lightweight fabric.",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1623609163859-ca93c959b98a?w=500&auto=format&fit=crop",
    ],
    category: "Dresses",
    tags: ["floral", "summer", "light", "casual"],
    color: "multicolor",
  },
  {
    name: "Bodycon Wrap Dress",
    brand: "Forever 21",
    price: 999,
    discount: "45% OFF",
    description: "Flattering wrap-style bodycon dress for evenings out.",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop",
    ],
    category: "Dresses",
    tags: ["bodycon", "evening", "wrap", "chic"],
    color: "red",
  },
  {
    name: "Classic Sneakers",
    brand: "Nike",
    price: 3499,
    discount: "30% OFF",
    description: "Versatile sneakers that combine style and comfort.",
    sizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500&auto=format&fit=crop",
    ],
    category: "Footwear",
    tags: ["sneakers", "casual", "sports", "white"],
    color: "white",
  },
  {
    name: "Running Shoes",
    brand: "Adidas",
    price: 4999,
    discount: "20% OFF",
    description: "High-performance running shoes with Boost cushioning.",
    sizes: ["UK6", "UK7", "UK8", "UK9", "UK10", "UK11"],
    images: [
      "https://images.unsplash.com/photo-1556906781-9a412961d28f?w=500&auto=format&fit=crop",
    ],
    category: "Footwear",
    tags: ["running", "sports", "performance", "mesh"],
    color: "black",
  },
  {
    name: "Slim Fit Chinos",
    brand: "Arrow",
    price: 1799,
    discount: "35% OFF",
    description: "Versatile chinos that pair well with everything.",
    sizes: ["28", "30", "32", "34", "36"],
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop",
    ],
    category: "Trousers",
    tags: ["chinos", "slim-fit", "formal", "beige"],
    color: "beige",
  },
  {
    name: "Ripped Skinny Jeans",
    brand: "Levis",
    price: 2299,
    discount: "30% OFF",
    description: "Trendy ripped skinny jeans for a street-style look.",
    sizes: ["28", "30", "32", "34"],
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop",
    ],
    category: "Jeans",
    tags: ["ripped", "skinny", "denim", "trendy"],
    color: "blue",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    // Insert new products
    const inserted = await Product.insertMany(PRODUCTS);
    console.log(`✅ Seeded ${inserted.length} products with category/tags/color`);

    // Print first 3 IDs for reference
    inserted.slice(0, 3).forEach((p) =>
      console.log(`   - ${p._id}  →  ${p.name}`)
    );
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
