const express = require("express")
const router = express.Router()
const User = require("../models/User")
const verifyToken = require("../middleware/authMiddleware")

// GET /api/users/me/bookmarks — get current user's bookmarked components (populated)
router.get("/me/bookmarks", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("bookmarked")
    if (!user) return res.status(404).json({message: "User not found"})
    res.json(user.bookmarked)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// POST /api/users/me/bookmarks/:componentId — toggle a bookmark on/off
router.post("/me/bookmarks/:componentId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({message: "User not found"})

    const {componentId} = req.params
    const index = user.bookmarked.findIndex((id) => id.equals(componentId))

    if (index === -1) {
      user.bookmarked.push(componentId)
    } else {
      user.bookmarked.splice(index, 1)
    }

    await user.save()

    const updated = await User.findById(req.user.id).populate("bookmarked")
    res.json(updated.bookmarked)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

module.exports = router
