const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();
const MAX_HISTORY = 20;


router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const existinguser = await User.findOne({ email });
    if (existinguser)
      return res.status(404).json({ message: "User already exisits" });
    const hashedpassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email,
      password: hashedpassword,
    });
    await user.save();
    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ user: userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) return res.status(404).json({ message: "Invalid password" });

    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ user: userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Update push token
router.put("/token/:id", async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { pushToken: token },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Push token updated successfully", pushToken: user.pushToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Update notification preferences
router.put("/preferences/:id", async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { notificationPreferences: preferences },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Preferences updated successfully", preferences: user.notificationPreferences });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ─── POST /user/history ───────────────────────────────────────────────────────
// Body: { userId, productId }
// Adds productId to the user's browsingHistory (deduped, capped at MAX_HISTORY).
// Silently succeeds if userId is missing (anonymous visitors).
router.post("/history", async (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) return res.status(200).json({ message: "ok" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove duplicate then prepend latest
    user.browsingHistory = user.browsingHistory.filter(
      (id) => id.toString() !== productId
    );
    user.browsingHistory.unshift(productId);
    if (user.browsingHistory.length > MAX_HISTORY) {
      user.browsingHistory = user.browsingHistory.slice(0, MAX_HISTORY);
    }
    await user.save();
    res.status(200).json({ message: "History updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;