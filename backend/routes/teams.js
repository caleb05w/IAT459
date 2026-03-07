const express = require("express")
const router = express.Router()
const Team = require("../models/Team")
const Component = require("../models/Component")
const verifyToken = require("../middleware/authMiddleware")

// POST /api/teams — create a team
router.post("/", verifyToken, async (req, res) => {
  try {
    const {name, externalId} = req.body

    const newTeam = new Team({
      name,
      owner: req.user.id,
      figmaID: externalId,
      contributors: [],
      components: [],
    })

    await newTeam.save()
    res.status(201).json(newTeam)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// GET /api/teams — get all teams the user owns or is a contributor of
router.get("/", verifyToken, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [{owner: req.user.id}, {contributors: req.user.id}],
    })
    res.json(teams)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// GET /api/teams/:id — get a single team with components
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate("components")
    if (!team) return res.status(404).json({message: "Team not found"})
    res.json(team)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// GET /api/teams/:id/components — get all components for a team
router.get("/:id/components", verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({message: "Team not found"})

    const isMember =
      team.owner.equals(req.user.id) ||
      team.contributors.some((c) => c.equals(req.user.id))

    if (!isMember) return res.status(403).json({message: "Not a team member"})

    const components = await Component.find({team: team._id})
    res.json(components)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

module.exports = router
