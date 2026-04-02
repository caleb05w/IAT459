import {useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "../context/AuthContext"
import {DataContext} from "../context/DataContext"
import {LuLayoutGrid, LuList} from "react-icons/lu"
import Button from "../components/Button"
import Sidebar from "../components/Sidebar"
import ProtectedNavbar from "../components/ProtectedNavbar"
import DashboardCard from "../components/DashboardCard"
import DashboardList from "../components/DashboardList"

export default function Bookmarks() {
  const navigate = useNavigate()
  const {user} = useContext(AuthContext)
  const {teams, activeTeam, setActiveTeam, bookmarks, toggleBookmark, isBookmarked} =
    useContext(DataContext)

  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("viewMode") || "grid",
  )

  const updateViewMode = (mode) => {
    localStorage.setItem("viewMode", mode)
    setViewMode(mode)
  }

  const bookmarkedComponents = Object.values(bookmarks)
  const username = user?.username || ""

  return (
    <div className="relative min-h-screen flex bg-white">
      <Sidebar
        activeNav="Bookmarks"
        activeTeam={activeTeam}
        setActiveTeam={(team) => {
          setActiveTeam(team)
          navigate(`/team/${team._id}`)
        }}
        teams={teams}
        username={username}
        setShowCreateTeam={() => navigate("/teams")}
      />
      <main className="relative flex-1 flex flex-col min-w-0 overflow-hidden">
        <ProtectedNavbar
          breadcrumbs={["Bookmarks"]}
          onBreadcrumbClick={() => {}}
        />

        <div className="flex-1 px-8 pt-6 pb-8 flex flex-col items-start">
          <div className="mb-[2rem]">
            <h3>Bookmarks</h3>
          </div>

          <div className="flex items-center gap-3 mb-[2rem] justify-end w-full">
            <div className="flex flex-row gap-[0.5rem]">
              <Button
                body={
                  <span className="flex items-center gap-1.5">
                    <LuLayoutGrid className="w-3.5 h-3.5" />
                    Grid
                  </span>
                }
                size="sm"
                style={viewMode === "grid" ? "tertiary" : "none"}
                onClick={() => updateViewMode("grid")}
              />
              <Button
                body={
                  <span className="flex items-center gap-1.5">
                    <LuList className="w-3.5 h-3.5" />
                    List
                  </span>
                }
                size="sm"
                style={viewMode === "list" ? "tertiary" : "none"}
                onClick={() => updateViewMode("list")}
              />
            </div>
          </div>

          {bookmarkedComponents.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm w-full">
              No bookmarked components yet
            </div>
          ) : viewMode === "grid" ? (
            <div className="flex flex-wrap gap-4">
              {bookmarkedComponents.map((component) => (
                <DashboardCard
                  key={component._id}
                  header={component.name}
                  body={component.description}
                  thumbnail={component.thumbnail}
                  last_updated={component.last_updated}
                  isBookmarked={isBookmarked(component._id)}
                  onBookmark={() => toggleBookmark(component)}
                  onClick={() => navigate("/details", {state: {component}})}
                />
              ))}
            </div>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-[180px_1fr_220px_40px] border-b border-gray-200 pb-2 mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Image
                </span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Title
                </span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Last Edited
                </span>
                <span />
              </div>
              {bookmarkedComponents.map((component) => (
                <DashboardList
                  key={component._id}
                  name={component.name}
                  thumbnail={component.thumbnail}
                  user={component.user}
                  last_updated={component.last_updated}
                  link=""
                  isBookmarked={isBookmarked(component._id)}
                  onBookmark={() => toggleBookmark(component)}
                  onClick={() => navigate("/details", {state: {component}})}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
