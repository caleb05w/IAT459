const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
//req = contains what the frontend sends you
//res is what you use to send something back to the frontend.
router.post("/register", async (req, res) => {
  try {
    //extract username and password from the request body.
    const { username, password } = req.body;

    // 1. check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // 2. hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. save the user
    const newUser = new User({ username, password: hashedPassword });
    //actually saves the user to the database.
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    //first, need to pull the username and password that was passed from frontend.
    const { username, password } = req.body;

    //need to find user first from database
    const user = await User.findOne({ username });
    //if no user is found, return error message
    if (!user) return res.status(400).json({ message: "User not found" });

    //search passwords
    const isMatch = await bycrypt.compare(password, user.password);
    // fallback if no passwords match. Basically says no matching password
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    //generate "wristband" for user.
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "1h" },
    );

    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (e) {
    res.status(500).json({ error: e.message });
    console.warn("error trying to sign in", e);
  }
});
