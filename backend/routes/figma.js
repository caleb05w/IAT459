const express = require("express")
const router = express.Router()

const FIGMA_TOKEN = process.env.FIGMA_TOKEN
const FIGMA_TEAM_ID = process.env.FIGMA_TEAM_ID
const FIGMA_BASE_URL = "https://api.figma.com/v1"

const figmaFetch = (endpoint) =>
  fetch(`${FIGMA_BASE_URL}${endpoint}`, {
    headers: {"X-Figma-Token": FIGMA_TOKEN},
  }).then((res) => res.json())

// GET /api/figma/components
router.get("/components", async (req, res) => {
  try {
    const componentData = await figmaFetch(`/teams/${FIGMA_TEAM_ID}/components`)
    console.log("raw:", JSON.stringify(componentData, null, 2))
    const components = componentData.meta?.entries ?? []

    if (components.length === 0) return res.json([])

    const result = components.map((component) => ({
      node_id: component.node_id,
      name: component.name,
      description: component.description ?? "",
      last_updated: component.updated_at,
      user: component.created_by?.handle ?? "Unknown",
      thumbnail: component.thumbnail_url ?? null,
      link: `https://www.figma.com/design/${component.file_key}?node-id=${component.node_id}`,
      file_name: component.containing_frame?.pageName ?? "",
    }))

    res.json(result)
  } catch (err) {
    console.error("Figma API error:", err)
    res.status(500).json({error: "Failed to fetch Figma components"})
  }
})

module.exports = router
