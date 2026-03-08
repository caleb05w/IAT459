// Strip the Figma ID
export function extractTeamId(url) {
  const match = url.match(/\/team\/(\d+)/)
  return match ? match[1] : null
}
