const express = require("express")
const router = express.Router()
const Team = require("../models/Team")
const Project = require("../models/Project")
const verifyToken = require("../middleware/authMiddleware")

// POST /api/teams — create a team
router.post("/", verifyToken, async (req, res) => {
  try {
    const {name} = req.body

    const newTeam = new Team({
      name,
      owner: req.user.id,
      contributors: [],
      projects: [],
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

// GET /api/teams/:id — get a single team
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate("projects")

    if (!team) return res.status(404).json({message: "Team not found"})

    res.json(team)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// POST /api/teams/:id/projects — create a project inside a team
router.post("/:id/projects", verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)

    if (!team) return res.status(404).json({message: "Team not found"})

    // only owner or contributors can add projects
    const isMember =
      team.owner === req.user.id || team.contributors.includes(req.user.id)

    if (!isMember) return res.status(403).json({message: "Not a team member"})

    const newProject = new Project({
      name: req.body.name,
      team: team._id,
      files: [],
    })

    await newProject.save()

    // push the project reference into the team
    team.projects.push(newProject._id)
    await team.save()

    res.status(201).json(newProject)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// GET /api/teams/:id/projects — get all projects in a team
router.get("/:id/projects", verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)

    if (!team) return res.status(404).json({message: "Team not found"})

    const projects = await Project.find({team: team._id})
    res.json(projects)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

module.exports = router
