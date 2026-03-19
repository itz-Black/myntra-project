const express = require("express");
const Bag = require("../models/Bag");
const Order = require("../models/Order");
const User = require("../models/User");
const { sendPushNotification } = require("../services/NotificationService");
const router = express.Router();
const mongoose = require("mongoose");

function genrateRandomTracking() {
  const carriers = ["Delhivery", "Bluedart", "Ecom Express", "XpressBees"];
  const statusOptions = [
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "In Transit",
  ];
  const locations = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"];
  const randomcarrier = carriers[Math.floor(Math.random() * carriers.length)];
  const randomstatusOptions =
    statusOptions[Math.floor(Math.random() * statusOptions.length)];
  const randomlocations =
    locations[Math.floor(Math.random() * locations.length)];

  return {
    number: "TRK" + Math.floor(Math.random() * 10000000),
    carrier: randomcarrier,
    estimatedDelivery: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ).toISOString(),
    currentLocation: randomlocations,
    status: randomstatusOptions,
    timeline: [
      {
        status: "Order placed",
        location: "Warehouse",
        timestamp: new Date().toISOString(),
      },
      {
        status: randomstatusOptions,
        location: randomlocations,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
router.post("/create/:userId", async (req, res) => {
  try {
    const userid = req.params.userId;
    const bag = await Bag.find({ userId: userid }).populate("productId");
    if (bag.length === 0) {
      return res.status(400).json({ message: "No item in the bag" });
    }
    const orderitem = bag.map((item) => ({
      productId: item.productId._id,
      size: item.size,
      price: item.productId.price,
      quantity: item.quantity,
    }));
    const total = orderitem.reduce(
      (sum, item) => sum + item.price + item.quantity,
      0
    );
    const newOrder = new Order({
      userId: userid,
      date: new Date().toISOString(),
      status: "Processing",
      items: orderitem,
      total: total,
      shippingAddress: req.body.shippingAddress,
      paymentMethod:req.body.paymentMethod,
      tracking: genrateRandomTracking(),
    });
    await newOrder.save();
    await Bag.deleteMany({ userId: userid });

    // Send push notification
    const user = await User.findById(userid);
    if (user && user.pushToken && user.notificationPreferences?.orderUpdates !== false) {
      const message = {
        title: "Order Confirmed! 🎉",
        body: `Your order for ₹${total} has been successfully placed.`,
        data: { route: "/(tabs)/profile" } // Can link to order history list
      };
      await sendPushNotification([user.pushToken], message);
    }

    res.status(200).json({ message: "Order placed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
router.get("/user/:userid", async (req, res) => {
  try {
    const order = await Order.find({ userId: req.params.userid }).populate(
      "items.productId"
    );
    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/transactions/export/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });

    const { format } = req.query;

    if (format === 'csv') {
      const csvHeader = "Transaction ID,Date,Amount,Payment Mode,Status,Type\n";
      const csvRows = orders.map(order => {
        const pMethod = order.paymentMethod || "Online";
        const type = pMethod.toLowerCase().includes('cod') || pMethod.toLowerCase().includes('cash') ? 'COD' : 'Online';
        // For CSV safety, quote strings
        return `"${order._id}","${order.date || new Date().toISOString()}",${order.total || 0},"${pMethod}","${order.status}","${type}"`;
      }).join("\n");
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
      return res.send(csvHeader + csvRows);
    }
    
    // Default JSON formatting for the app UI
    const formattedTransactions = orders.map(order => {
      const pMethod = order.paymentMethod || "Online";
      const type = pMethod.toLowerCase().includes('cod') || pMethod.toLowerCase().includes('cash') ? 'COD' : 'Online';
      let status = 'Failed';
      if (['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'In Transit'].includes(order.status)) {
        status = 'Success';
      }
      return {
        id: order._id,
        date: order.date || order.createdAt || new Date().toISOString(),
        amount: order.total || 0,
        mode: pMethod,
        status: status,
        type: type
      };
    });
    
    return res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;