const express = require("express")
const router = express.Router()
const Team = require("../models/Team")
const Component = require("../models/Component")
const verifyToken = require("../middleware/authMiddleware")

const FIGMA_TOKEN = process.env.FIGMA_TOKEN

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

// POST /api/teams/:id/sync — fetch from Figma, upsert into DB, link to team
router.post("/:id/sync", verifyToken, async (req, res) => {
  try {
    // look up the team by MongoDB id
    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({message: "Team not found"})

    // only the owner or a contributor can trigger a sync (usecase: visitor access to team )
    // prevents overuse of api calls for non members
    const isMember =
      team.owner.equals(req.user.id) ||
      team.contributors.some((c) => c.equals(req.user.id))
    if (!isMember) return res.status(403).json({message: "Not a team member"})

    // call the Figma API to get all published components for this team
    const figmaRes = await fetch(
      `https://api.figma.com/v1/teams/${team.figmaID}/components`,
      {headers: {"X-Figma-Token": FIGMA_TOKEN}},
    )
    const figmaData = await figmaRes.json()
    console.log("Figma sync response:", JSON.stringify(figmaData, null, 2))

    // components live under figmaData.meta.components (default to empty array if missing)
    const entries = figmaData.meta?.components ?? []

    // upsert each Figma component into our DB and collect its _id
    const componentIds = []
    for (const entry of entries) {
      // match on team + node_id -->  re-syncing updates existing records instead of duplicating
      const component = await Component.findOneAndUpdate(
        {team: team._id, node_id: entry.node_id},
        {
          team: team._id,
          node_id: entry.node_id,
          name: entry.name,
          description: entry.description ?? "",
          last_updated: entry.updated_at,
          user: entry.created_by?.handle ?? "Unknown",
          thumbnail: entry.thumbnail_url ?? null,
          // build a direct link to the component in Figma
          link: `https://www.figma.com/design/${entry.file_key}?node-id=${entry.node_id}`,
        },
        {upsert: true, returnDocument: "after"},
      )
      componentIds.push(component._id)
    }

    // replace the team's component list with the newly synced set and save
    team.components = componentIds
    await team.save()

    // return all components for this team to the frontend
    const components = await Component.find({team: team._id})
    res.json(components)
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
