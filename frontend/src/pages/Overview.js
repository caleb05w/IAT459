import {useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {DataContext} from "../context/DataContext"
import {AuthContext} from "../context/AuthContext"
import {toSlug} from "../utils/toSlug"

import Sidebar from "../components/Sidebar"
import PageTitle from "../components/PageTitle"
import SettingsRow from "../components/SettingsRow"
import DashboardCard from "../components/DashboardCard"
import Button from "../components/Button"

export default function Overview() {
  const {user} = useContext(AuthContext)
  const {teams, activeTeam, setActiveTeam, components, toggleBookmark, isBookmarked, refresh} =
    useContext(DataContext)
  const navigate = useNavigate()
  const username = user?.username || ""

  const [refreshStatus, setRefreshStatus] = useState(null) // null | "success" | "no-changes" | "error"
  const [refreshStatusMsg, setRefreshStatusMsg] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    const before = components
    setRefreshing(true)
    setRefreshStatus(null)
    setRefreshStatusMsg("")
    const result = await refresh()
    setRefreshing(false)
    if (typeof result === "string") {
      setRefreshStatus("error")
      setRefreshStatusMsg(result)
    } else if (result?.components) {
      const next = result.components
      const hasNew = next.length !== before.length
      const hasUpdates = next.some((c) => c.hasUpdate)
      if (hasNew || hasUpdates) {
        setRefreshStatus("success")
        setRefreshStatusMsg(
          hasNew
            ? `${next.length - before.length} new component${next.length - before.length !== 1 ? "s" : ""} synced`
            : "Updates found — review in Components"
        )
      } else {
        setRefreshStatus("no-changes")
        setRefreshStatusMsg("Already up to date")
      }
    }
  }

  const recentComponents = [...components]
    .sort((a, b) => new Date(b.curr_last_updated) - new Date(a.curr_last_updated))
    .slice(0, 5)

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar activeTeam={activeTeam} setActiveTeam={setActiveTeam} teams={teams} username={username} />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 page-gutter-x page-gutter-y flex flex-col">
          <PageTitle
            breadcrumbs={[activeTeam?.name, "Overview"]}
            onBreadcrumbClick={(i) => { if (i === 0) navigate("/teams") }}
          />

          {/* Sync */}
          <p className="text-sm text-gray-400 mb-4">Sync</p>
          <div className="flex flex-col gap-3 mb-8">
            <SettingsRow
              title="Pull Changes"
              description={
                refreshStatus === null ? (
                  "Sync the latest component updates from Figma"
                ) : (
                  <span className={
                    refreshStatus === "success" ? "text-green-500" :
                    refreshStatus === "no-changes" ? "text-yellow-500" :
                    "text-red-500"
                  }>
                    {refreshStatusMsg}
                  </span>
                )
              }
              buttonLabel={refreshing ? "Syncing…" : "Pull Changes"}
              onAction={handleRefresh}
            />
          </div>

          {/* Recent Components */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">Recent Components</p>
            {activeTeam && (
              <Button
                body="See All"
                size="sm"
                style="secondary"
                onClick={() => navigate(`/team/${toSlug(activeTeam.name)}`)}
              />
            )}
          </div>

          {recentComponents.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No components yet — pull changes to sync from Figma
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {recentComponents.map((component, i) => (
                <DashboardCard
                  key={i}
                  header={component.name}
                  body={component.curr_description}
                  thumbnail={component.curr_thumbnail}
                  last_updated={component.curr_last_updated}
                  hasUpdate={component.hasUpdate}
                  isBookmarked={isBookmarked(component._id)}
                  onBookmark={() => toggleBookmark(component)}
                  onClick={() =>
                    navigate(`/team/${toSlug(activeTeam.name)}/details`, {
                      state: {component},
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  )
}
