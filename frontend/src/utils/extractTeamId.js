export function extractTeamId(url) {
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split("/").filter(Boolean)

    // github.com/org/repo          → last segment = repo name
    // figma.com/files/TEAMID/...   → segment after "files"
    // notion.so/team/TEAMID        → last segment
    // generic fallback             → last non-empty segment

    if (parsed.hostname.includes("figma.com")) {
      const idx = parts.indexOf("files")
      return idx !== -1 ? parts[idx + 1] : parts[parts.length - 1]
    }

    // default — just grab the last path segment
    return parts[parts.length - 1]
  } catch {
    return null
  }
}
