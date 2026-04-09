import {useContext, useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "../context/AuthContext"
import {DataContext} from "../context/DataContext"
import {toSlug} from "../utils/toSlug"
import {LuLayoutGrid, LuList} from "react-icons/lu"
import Button from "../components/Button"
import Sidebar from "../components/Sidebar"
import PageTitle from "../components/PageTitle"
import SearchBar from "../components/SearchBar"
import Dropdown from "../components/Dropdown"
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
  const [sortBy, setSortBy] = useState("Latest")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredComponents, setFilteredComponents] = useState([])

  const updateViewMode = (mode) => {
    localStorage.setItem("viewMode", mode)
    setViewMode(mode)
  }

  const bookmarkedComponents = Object.values(bookmarks)
  const username = user?.username || ""

  useEffect(() => {
    let result = [...bookmarkedComponents]
    if (sortBy === "Latest") {
      result.sort((a, b) => new Date(b.curr_last_updated) - new Date(a.curr_last_updated))
    } else if (sortBy === "Oldest") {
      result.sort((a, b) => new Date(a.curr_last_updated) - new Date(b.curr_last_updated))
    } else if (sortBy === "A-Z") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) result = result.filter((c) => c.name.toLowerCase().includes(q))
    setFilteredComponents(result)
  }, [searchQuery, bookmarks, sortBy])

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
        <div className="flex-1 page-gutter-x page-gutter-y flex flex-col items-start">
          <PageTitle breadcrumbs={["Bookmarks"]} />

          <div className="flex items-center gap-3 mb-6 justify-between w-full">
            <div className="flex flex-row gap-[0.5rem] flex-1">
              <Dropdown
                value={sortBy}
                options={["Latest", "Oldest", "A-Z"]}
                onChange={setSortBy}
              />
              <div className="flex-1">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
            </div>
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

          {filteredComponents.length === 0 ? (
            <p className="flex items-center justify-center h-48 text-gray-400 text-sm w-full">
              No bookmarked components yet
            </p>
          ) : viewMode === "grid" ? (
            <div className="flex flex-wrap gap-4">
              {filteredComponents.map((component) => (
                <DashboardCard
                  key={component._id}
                  header={component.name}
                  body={component.curr_description}
                  thumbnail={component.curr_thumbnail}
                  last_updated={component.curr_last_updated}
                  isBookmarked={isBookmarked(component._id)}
                  onBookmark={() => toggleBookmark(component)}
                  onClick={() => {
                    const team = teams.find((t) => t._id === component.team)
                    const path = team ? `/team/${toSlug(team.name)}/details` : "/details"
                    navigate(path, {state: {component}})
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-[180px_1fr_220px_40px] border-b border-gray-200 pb-2 mb-1">
                <h6 className="font-medium text-gray-500 uppercase tracking-wide">Image</h6>
                <h6 className="font-medium text-gray-500 uppercase tracking-wide">Title</h6>
                <h6 className="font-medium text-gray-500 uppercase tracking-wide">Last Edited</h6>
                <span />
              </div>
              {filteredComponents.map((component) => (
                <DashboardList
                  key={component._id}
                  name={component.name}
                  thumbnail={component.curr_thumbnail}
                  user={component.last_user}
                  last_updated={component.curr_last_updated}
                  link=""
                  isBookmarked={isBookmarked(component._id)}
                  onBookmark={() => toggleBookmark(component)}
                  onClick={() => {
                    const team = teams.find((t) => t._id === component.team)
                    const path = team ? `/team/${toSlug(team.name)}/details` : "/details"
                    navigate(path, {state: {component}})
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
