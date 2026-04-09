import {useContext, useEffect, useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import {AuthContext} from "../context/AuthContext"
import {DataContext} from "../context/DataContext"

import {LuLayoutGrid, LuList} from "react-icons/lu"
import Button from "../components/Button"

import Sidebar from "../components/Sidebar"
import DashboardCard from "../components/DashboardCard"
import DashboardList from "../components/DashboardList"
import SearchBar from "../components/SearchBar"
import Dropdown from "../components/Dropdown"
import PageTitle from "../components/PageTitle"

export default function Dashboard() {
  const {slug} = useParams()
  const {user} = useContext(AuthContext)
  const {teams, activeTeam, setActiveTeam, components, toggleBookmark, isBookmarked} =
    useContext(DataContext)
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState("")
  const [filteredComponents, setFilteredComponents] = useState([])
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("viewMode") || "grid",
  )
  const [sortBy, setSortBy] = useState("Latest")

  useEffect(() => {
    let result = [...components]
    if (sortBy === "Updated") {
      result = result.filter((c) => c.hasUpdate)
    } else if (sortBy === "Latest") {
      result.sort(
        (a, b) => new Date(b.curr_last_updated) - new Date(a.curr_last_updated),
      )
    } else if (sortBy === "Oldest") {
      result.sort(
        (a, b) => new Date(a.curr_last_updated) - new Date(b.curr_last_updated),
      )
    } else if (sortBy === "A-Z") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }
    const q = searchQuery.trim().toLowerCase()
    if (q) result = result.filter((c) => c.name.toLowerCase().includes(q))
    setFilteredComponents(result)
  }, [searchQuery, components, sortBy])

  useEffect(() => {
    setFilteredComponents(components)
    setSearchQuery("")
  }, [components])

  const updateViewMode = (mode) => {
    localStorage.setItem("viewMode", mode)
    setViewMode(mode)
  }

  const username = user?.username || ""

  return (
    <div className='relative min-h-screen flex bg-white'>
      <Sidebar activeTeam={activeTeam} setActiveTeam={setActiveTeam} teams={teams} username={username} />
      <main className='relative flex-1 flex flex-col min-w-0 overflow-hidden'>
        <div className='flex-1 page-gutter-x page-gutter-y flex flex-col'>
          <PageTitle
            breadcrumbs={[activeTeam?.name, "Components"]}
            onBreadcrumbClick={(i) => { if (i === 0) navigate("/teams") }}
          />

          <div className='flex items-center gap-3 mb-6 justify-between w-full'>
            <div className='flex flex-row gap-2 flex-1'>
              <Dropdown
                value={sortBy}
                options={["Latest", "Oldest", "A-Z", "Updated"]}
                onChange={setSortBy}
              />
              <div className='flex-1'>
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
            </div>
            <div className='flex items-center gap-3'>
<div className='flex gap-1 p-0.5 bg-gray-100 rounded-full'>
                <Button
                  body={
                    <span className='flex items-center gap-1.5'>
                      <LuLayoutGrid className='w-3.5 h-3.5' />
                      Grid
                    </span>
                  }
                  size='sm'
                  style={viewMode === "grid" ? "tertiary" : "none"}
                  onClick={() => updateViewMode("grid")}
                />
                <Button
                  body={
                    <span className='flex items-center gap-1.5'>
                      <LuList className='w-3.5 h-3.5' />
                      List
                    </span>
                  }
                  size='sm'
                  style={viewMode === "list" ? "tertiary" : "none"}
                  onClick={() => updateViewMode("list")}
                />
              </div>
            </div>
          </div>

          {filteredComponents.length === 0 ? (
            <p className='flex items-center justify-center h-48 text-gray-400 text-sm w-full'>
              No components in this team yet
            </p>
          ) : viewMode === "grid" ? (
            <div className='flex flex-wrap gap-4'>
              {filteredComponents.map((component, i) => (
                <DashboardCard
                  key={i}
                  header={component.name}
                  body={component.curr_description}
                  thumbnail={component.curr_thumbnail}
                  last_updated={component.curr_last_updated}
                  hasUpdate={component.hasUpdate}
                  link={component.link}
                  isBookmarked={isBookmarked(component._id)}
                  onBookmark={() => toggleBookmark(component)}
                  onClick={() =>
                    navigate(`/team/${slug}/details`, {state: {component}})
                  }
                />
              ))}
            </div>
          ) : (
            <div className='w-full border border-gray-200 rounded-xl overflow-hidden'>
              <div className='grid grid-cols-[180px_1fr_220px_40px] px-4 py-2.5 bg-gray-50 border-b border-gray-100'>
                <h6 className='font-medium text-gray-500 uppercase tracking-wide'>Image</h6>
                <h6 className='font-medium text-gray-500 uppercase tracking-wide'>Title</h6>
                <h6 className='font-medium text-gray-500 uppercase tracking-wide'>Last Edited</h6>
                <span />
              </div>
              {filteredComponents.map((component, i) => (
                <DashboardList
                  key={i}
                  name={component.name}
                  thumbnail={component.curr_thumbnail}
                  user={component.last_user}
                  last_updated={component.curr_last_updated}
                  hasUpdate={component.hasUpdate}
                  link={""}
                  isBookmarked={isBookmarked(component._id)}
                  onBookmark={() => toggleBookmark(component)}
                  onClick={() =>
                    navigate(`/team/${slug}/details`, {state: {component}})
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
