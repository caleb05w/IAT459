const express = require("express")
const router = express.Router()

// Temporary tokens --> will retrieve from database later
const FIGMA_TOKEN = process.env.FIGMA_TOKEN
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY
const FIGMA_BASE_URL = "https://api.figma.com/v1"

const figmaFetch = (endpoint) =>
  fetch(`${FIGMA_BASE_URL}${endpoint}`, {
    headers: {"X-Figma-Token": FIGMA_TOKEN},
  }).then((res) => res.json())

// GET /api/figma/components
router.get("/components", async (req, res) => {
  try {
    // Fetch file data and components in parallel
    const [fileData, componentData] = await Promise.all([
      figmaFetch(`/files/${FIGMA_FILE_KEY}`),
      figmaFetch(`/files/${FIGMA_FILE_KEY}/components`),
    ])
    console.log("fileData:", JSON.stringify(fileData, null, 2))
    console.log("componentData:", JSON.stringify(componentData, null, 2))

    const components = componentData.meta?.entries ?? []

    if (components.length === 0) {
      return res.json([])
    }

    // Get node IDs for thumbnail generation
    const nodeIds = components.map((c) => c.node_id).join(",")
    const imageData = await figmaFetch(
      `/images/${FIGMA_FILE_KEY}?ids=${nodeIds}&format=png`,
    )

    // Build response
    const result = components.map((component) => ({
      node_id: component.node_id,
      name: component.name,
      description: component.description ?? "",
      last_updated: fileData.lastModified,
      user: fileData.lastModifiedBy?.handle ?? "Unknown",
      thumbnail: imageData.images?.[component.node_id] ?? null,
      link: `https://www.figma.com/design/${FIGMA_FILE_KEY}?node-id=${component.node_id}`,
    }))

    res.json(result)
  } catch (err) {
    console.error("Figma API error:", err)
    res.status(500).json({error: "Failed to fetch Figma components"})
  }
})

// // test message
// router.get("/test", (req, res) => {
//   res.json({message: "figma route works"})
// })

module.exports = router
