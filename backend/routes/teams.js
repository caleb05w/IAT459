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

    if (!name || !name.trim()) return res.status(400).json({message: "Team name is required."})
    if (!externalId) return res.status(400).json({message: "Invalid Figma team URL. Expected format: figma.com/files/team/123456789/..."})

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

// helper — build the members array from a populated team doc
function buildMembers(team) {
  return [
    {_id: team.owner._id, username: team.owner.username, fName: team.owner.fName, lName: team.owner.lName, role: "Owner"},
    ...team.admins.map((a) => ({_id: a._id, username: a.username, fName: a.fName, lName: a.lName, role: "Admin"})),
    ...team.contributors.map((c) => ({_id: c._id, username: c.username, fName: c.fName, lName: c.lName, role: "Collaborator"})),
  ]
}

// GET /api/teams/:id/members — get owner + admins + contributors with user details
router.get("/:id/members", verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("owner", "username fName lName")
      .populate("admins", "username fName lName")
      .populate("contributors", "username fName lName")
    if (!team) return res.status(404).json({message: "Team not found"})
    res.json(buildMembers(team))
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// POST /api/teams/:id/members — add a member by username
router.post("/:id/members", verifyToken, async (req, res) => {
  try {
    const {username, role} = req.body
    if (!username) return res.status(400).json({message: "Username is required"})
    if (!["Admin", "Collaborator"].includes(role)) return res.status(400).json({message: "Role must be Admin or Collaborator"})

    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({message: "Team not found"})

    const isOwner = team.owner.equals(req.user.id)
    const isAdmin = team.admins.some((a) => a.equals(req.user.id))
    if (!isOwner && !isAdmin) return res.status(403).json({message: "Only owners or admins can add members"})

    const User = require("../models/User")
    const newUser = await User.findOne({username})
    if (!newUser) return res.status(404).json({message: "User not found"})

    // prevent duplicates
    const alreadyMember =
      team.owner.equals(newUser._id) ||
      team.admins.some((a) => a.equals(newUser._id)) ||
      team.contributors.some((c) => c.equals(newUser._id))
    if (alreadyMember) return res.status(409).json({message: "User is already a member"})

    if (role === "Admin") team.admins.push(newUser._id)
    else team.contributors.push(newUser._id)
    await team.save()

    const populated = await Team.findById(team._id)
      .populate("owner", "username fName lName")
      .populate("admins", "username fName lName")
      .populate("contributors", "username fName lName")
    res.json(buildMembers(populated))
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// PATCH /api/teams/:id/members/:userId/role — change a member's role
router.patch("/:id/members/:userId/role", verifyToken, async (req, res) => {
  try {
    const {role} = req.body
    if (!["Owner", "Admin", "Collaborator"].includes(role)) return res.status(400).json({message: "Invalid role"})

    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({message: "Team not found"})

    const isOwner = team.owner.equals(req.user.id)
    const isAdmin = team.admins.some((a) => a.equals(req.user.id))
    if (!isOwner && !isAdmin) return res.status(403).json({message: "Insufficient permissions"})
    if (!isOwner && role === "Owner") return res.status(403).json({message: "Only the owner can transfer ownership"})

    const targetId = req.params.userId

    // remove target from admins and contributors first
    team.admins = team.admins.filter((a) => !a.equals(targetId))
    team.contributors = team.contributors.filter((c) => !c.equals(targetId))

    if (role === "Owner") {
      // transfer ownership — old owner becomes admin
      team.admins.push(team.owner)
      team.owner = targetId
    } else if (role === "Admin") {
      team.admins.push(targetId)
    } else {
      team.contributors.push(targetId)
    }

    await team.save()

    const populated = await Team.findById(team._id)
      .populate("owner", "username fName lName")
      .populate("admins", "username fName lName")
      .populate("contributors", "username fName lName")
    res.json(buildMembers(populated))
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// DELETE /api/teams/:id/members/:userId — remove a member (or leave) and clean their bookmarks
router.delete("/:id/members/:userId", verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({message: "Team not found"})

    const isOwner = team.owner.equals(req.user.id)
    const isAdmin = team.admins.some((a) => a.equals(req.user.id))
    const isSelf = req.params.userId === req.user.id

    // Owner/admin can remove others; any member can remove themselves
    if (!isOwner && !isAdmin && !isSelf)
      return res.status(403).json({message: "Insufficient permissions"})

    // The team owner cannot be removed
    if (team.owner.equals(req.params.userId))
      return res.status(400).json({message: "Cannot remove the team owner"})

    team.admins = team.admins.filter((a) => !a.equals(req.params.userId))
    team.contributors = team.contributors.filter((c) => !c.equals(req.params.userId))
    await team.save()

    // Clean up: remove this team's components from the removed user's bookmarks
    const User = require("../models/User")
    const teamComponentIds = team.components.map((id) => id.toString())
    const removedUser = await User.findById(req.params.userId)
    if (removedUser) {
      removedUser.bookmarked = removedUser.bookmarked.filter(
        (id) => !teamComponentIds.includes(id.toString()),
      )
      await removedUser.save()
    }

    const populated = await Team.findById(team._id)
      .populate("owner", "username fName lName")
      .populate("admins", "username fName lName")
      .populate("contributors", "username fName lName")
    res.json(buildMembers(populated))
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// POST /api/teams/:id/leave — leave a team
// If the owner leaves: transfer to oldest admin → oldest contributor → delete the team
router.post("/:id/leave", verifyToken, async (req, res) => {
  try {
    const User = require("../models/User")
    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({message: "Team not found"})

    const userId = req.user.id
    const isOwner = team.owner.equals(userId)

    if (isOwner) {
      if (team.admins.length > 0) {
        // Transfer to oldest admin (first in array)
        const newOwner = team.admins[0]
        team.admins.shift()
        team.owner = newOwner
        await team.save()
      } else if (team.contributors.length > 0) {
        // Transfer to oldest contributor
        const newOwner = team.contributors[0]
        team.contributors.shift()
        team.owner = newOwner
        await team.save()
      } else {
        // No other members — delete the team
        await Component.deleteMany({team: team._id})
        await team.deleteOne()
        return res.json({deleted: true})
      }
    } else {
      // Non-owner: just remove from admins or contributors
      team.admins = team.admins.filter((a) => !a.equals(userId))
      team.contributors = team.contributors.filter((c) => !c.equals(userId))
      await team.save()
    }

    // Clean up: remove this team's components from the leaving user's bookmarks
    const teamComponentIds = team.components.map((id) => id.toString())
    const leavingUser = await User.findById(userId)
    if (leavingUser) {
      leavingUser.bookmarked = leavingUser.bookmarked.filter(
        (id) => !teamComponentIds.includes(id.toString()),
      )
      await leavingUser.save()
    }

    res.json({deleted: false})
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// DELETE /api/teams/:id — permanently delete a team and its components
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({message: "Team not found"})
    if (!team.owner.equals(req.user.id))
      return res.status(403).json({message: "Only the owner can delete the team"})

    await Component.deleteMany({team: team._id})
    await team.deleteOne()
    res.json({message: "Team deleted"})
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// PATCH /api/teams/:id — update team name
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const {name} = req.body
    if (!name || !name.trim()) return res.status(400).json({message: "Name is required"})

    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({message: "Team not found"})
    if (!team.owner.equals(req.user.id)) return res.status(403).json({message: "Only the owner can rename the team"})

    team.name = name.trim()
    await team.save()
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
    console.log("Figma sync response:", JSON.stringify(figmaData, null, 2));

    if (figmaData.error) {
      return res.status(figmaData.status).json({message: figmaData.message})
    }

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

// GET /api/teams/components/public — get all public components across all teams

//grabs all components that are public.
router.get("/components/public", async (req, res) => {
  try {
    //seeks components that have public set to true (using find)
    const components = await Component.find({public: true})
    res.status(200).json(components)
  } catch (err) {
    res.status(500).json({message: err.message})
  }
})

// POST /api/teams/:id/components/:componentId/visibility — update a component's public field
//caleb come back and leave some documentations
router.post(
  "/:id/components/:componentId/visibility",
  verifyToken,
  //requires token
  async (req, res) => {
    try {
      //find team
      const team = await Team.findById(req.params.id)
      //fallback
      if (!team) return res.status(404).json({message: "Team not found"})

      //ensures member is part of team, checks through members in the team and verifies that their id is a part fo that team.
      const isMember =
        team.owner.equals(req.user.id) ||
        team.contributors.some((c) => c.equals(req.user.id))
      if (!isMember) return res.status(403).json({message: "Not a team member"})
      //ability to update public status, pulling it from req
      const {public: isPublic} = req.body
      const component = await Component.findByIdAndUpdate(
        req.params.componentId,
        {public: isPublic},
        {new: true},
      )
      if (!component)
        return res.status(404).json({message: "Component not found"})

      res.json(component)
    } catch (err) {
      res.status(500).json({message: err.message})
    }
  },
)

module.exports = router
