const express = require("express")
const router = express.Router()
const Team = require("../models/Team")
const verifyToken = require("../middleware/authMiddleware")


// GET /api/teams — get all teams the user owns or is a contributor of
router.get("/", verifyToken, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [{ owner: req.user.id }, { contributors: req.user.id }],
    })

    res.json(teams)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/teams/:id — get a single team
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate("projects")

    if (!team) return res.status(404).json({ message: "Team not found" })

    res.json(team)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})





module.exports = router
