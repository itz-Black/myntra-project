const express = require("express");
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

const PRODUCTS = [
  { _id: "1", name: "Casual White T-Shirt", brand: "Roadster", price: 499, discount: "60% OFF", sizes: ["S", "M", "L", "XL"], images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop"], category: "Men", tags: ["casual", "cotton", "summer", "white"], color: "white", createdAt: new Date().toISOString() },
  { _id: "2", name: "Classic Striped T-Shirt", brand: "H&M", price: 399, discount: "50% OFF", sizes: ["S", "M", "L", "XL", "XXL"], images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&auto=format&fit=crop"], category: "Men", tags: ["casual", "striped", "cotton"], color: "blue", createdAt: new Date().toISOString() },
  { _id: "3", name: "Denim Jacket", brand: "Levis", price: 2499, discount: "40% OFF", sizes: ["S", "M", "L", "XL"], images: ["https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop"], category: "Men", tags: ["denim", "jacket", "casual", "blue"], color: "blue", createdAt: new Date().toISOString() },
  { _id: "4", name: "Summer Floral Dress", brand: "ONLY", price: 1299, discount: "50% OFF", sizes: ["XS", "S", "M", "L"], images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop"], category: "Women", tags: ["floral", "summer", "light", "casual"], color: "multicolor", createdAt: new Date().toISOString() },
  { _id: "5", name: "Classic Sneakers", brand: "Nike", price: 3499, discount: "30% OFF", sizes: ["UK6", "UK7", "UK8", "UK9", "UK10"], images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop"], category: "Kids", tags: ["sneakers", "casual", "sports", "white"], color: "white", createdAt: new Date().toISOString() },
  { _id: "6", name: "Skinny Fit Jeans", brand: "Wrogn", price: 1199, discount: "40% OFF", sizes: ["30", "32", "34", "36"], images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop"], category: "Men", tags: ["jeans", "casual", "blue"], color: "blue", createdAt: new Date().toISOString() }
];

const CATEGORIES = [
  { _id: "cat_1", name: "Men", subcategory: ["T-Shirts", "Shirts", "Jeans", "Jackets"], image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop", productId: PRODUCTS.filter(p=>p.category==="Men").map(p=>p) },
  { _id: "cat_2", name: "Women", subcategory: ["Dresses", "Tops", "Ethnic Wear"], image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop", productId: PRODUCTS.filter(p=>p.category==="Women").map(p=>p) },
  { _id: "cat_3", name: "Kids", subcategory: ["Boys Clothing", "Girls Clothing", "Footwear"], image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&auto=format&fit=crop", productId: PRODUCTS.filter(p=>p.category==="Kids").map(p=>p) },
  { _id: "cat_4", name: "Beauty", subcategory: ["Makeup", "Skincare"], image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop", productId: [] },
];

app.get("/", (req, res) => res.send("✅ Fallback API Working"));

// Simulate Mongoose routes for Category
app.get("/category", (req, res) => res.json(CATEGORIES));

// Simulate Mongoose routes for Product
app.get("/product", (req, res) => res.json(PRODUCTS));

// Product details
app.get("/product/:id", (req, res) => {
  const prod = PRODUCTS.find(p => p._id === req.params.id);
  res.json(prod || null);
});

// Mock recommendations endpoint
app.get("/product/recommendations", (req, res) => {
  const { category, currentProductId } = req.query;
  const filtered = PRODUCTS.filter(p => p.category === category && p._id !== currentProductId);
  res.json(filtered.map(product => ({ ...product, badgeType: 'Similar' })));
});

// Mock Wishlist
let WISHLIST = [
  { _id: 'w1', userId: 'default_tester', productId: '1' },
  { _id: 'w2', userId: 'default_tester', productId: '2' },
];
app.post("/wishlist", (req, res) => {
  const { userId, productId } = req.body;
  const exist = WISHLIST.find(w => w.userId === userId && w.productId === productId);
  if (!exist) {
    WISHLIST.push({ _id: Math.random().toString(36).substring(7), userId, productId });
  }
  res.json({ message: "Added to wishlist" });
});

app.get("/wishlist/:userId", (req, res) => {
  const userWishlist = WISHLIST.filter(w => w.userId === req.params.userId);
  const populated = userWishlist.map(w => {
    const product = PRODUCTS.find(p => p._id === w.productId);
    return { ...w, productId: product }; // Populated
  }).filter(w => w.productId != null);
  res.json(populated);
});

app.delete("/wishlist/:id", (req, res) => {
  WISHLIST = WISHLIST.filter(w => w._id !== req.params.id);
  res.json({ message: "Removed from wishlist" });
});

// Mock Bag
let BAG = [
  { _id: 'b1', userId: 'default_tester', productId: '1', quantity: 1 },
];
app.post("/bag", (req, res) => {
  const { userId, productId, quantity } = req.body;
  const existIndex = BAG.findIndex(b => b.userId === userId && b.productId === productId);
  if (existIndex >= 0) {
    BAG[existIndex].quantity += (quantity || 1);
  } else {
    BAG.push({ _id: Math.random().toString(36).substring(7), userId, productId, quantity: quantity || 1 });
  }
  res.json({ message: "Added to bag" });
});

app.get("/bag/:userId", (req, res) => {
  const userBag = BAG.filter(b => b.userId === req.params.userId);
  const populated = userBag.map(b => {
    const product = PRODUCTS.find(p => p._id === b.productId);
    return { ...b, productId: product }; // Populated
  }).filter(b => b.productId != null);
  res.json(populated);
});

app.delete("/bag/:id", (req, res) => {
  BAG = BAG.filter(b => b._id !== req.params.id);
  res.json({ message: "Removed from bag" });
});

app.put("/bag/:id", (req, res) => {
  const { quantity } = req.body;
  const existIndex = BAG.findIndex(b => b._id === req.params.id);
  if (existIndex >= 0) {
    BAG[existIndex].quantity = quantity;
  }
  res.json({ message: "Bag updated" });
});

// Mock Orders
let ORDERS = [];

function generateRandomTracking() {
  const carriers = ["Delhivery", "Bluedart", "Ecom Express", "XpressBees"];
  const statusOptions = ["Shipped", "Out for Delivery", "Delivered", "In Transit"];
  const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"];
  const carrier = carriers[Math.floor(Math.random() * carriers.length)];
  const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  return {
    number: "TRK" + Math.floor(Math.random() * 10000000),
    carrier,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    currentLocation: location,
    status,
    timeline: [
      { status: "Order placed", location: "Warehouse", timestamp: new Date().toISOString() },
      { status, location, timestamp: new Date().toISOString() },
    ],
  };
}

// Place an order from bag items
app.post("/order/create/:userId", (req, res) => {
  const userId = req.params.userId;
  const userBag = BAG.filter(b => b.userId === userId);
  if (userBag.length === 0) {
    return res.status(400).json({ message: "No items in the bag" });
  }
  const items = userBag.map(b => {
    const product = PRODUCTS.find(p => p._id === b.productId);
    return { _id: Math.random().toString(36).substring(7), productId: product, size: b.size || "M", price: product ? product.price : 0, quantity: b.quantity || 1 };
  });
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const newOrder = {
    _id: "ORD" + Date.now(),
    userId,
    date: new Date().toISOString(),
    status: "Processing",
    items,
    total,
    shippingAddress: req.body.shippingAddress || "123 Main Street, New York, NY 10001",
    paymentMethod: req.body.paymentMethod || "Card",
    tracking: generateRandomTracking(),
  };
  ORDERS.push(newOrder);
  // Clear user's bag
  BAG = BAG.filter(b => b.userId !== userId);
  res.status(200).json({ message: "Order placed successfully", order: newOrder });
});

// Get all orders for a user
app.get("/order/user/:userid", (req, res) => {
  const userOrders = ORDERS.filter(o => o.userId === req.params.userid);
  res.json(userOrders);
});

// Any other route just returns an empty array to prevent UI crashing
app.use((req, res) => {
  if (req.method === 'GET') {
      res.json([]);
  } else {
      res.json({ message: "Success MOCK" });
  }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Patched Fake API Server is running on port ${PORT}`));
