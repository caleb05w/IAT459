import {useContext, useEffect, useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import {AuthContext} from "../context/AuthContext"
import {DataContext} from "../context/DataContext"

import {LuLayoutGrid, LuList} from "react-icons/lu"
import Button from "../components/Button"

import Sidebar from "../components/Sidebar"
import ProtectedNavbar from "../components/ProtectedNavbar"
import DashboardCard from "../components/DashboardCard"
import DashboardList from "../components/DashboardList"
import SearchBar from "../components/SearchBar"
import Dropdown from "../components/Dropdown"

export default function Dashboard() {
  const {slug} = useParams()
  const {user} = useContext(AuthContext)
  const {activeTeam, components, toggleBookmark, isBookmarked} =
    useContext(DataContext)
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState("")
  const [filteredComponents, setFilteredComponents] = useState([])
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("viewMode") || "grid",
  )
  const [sortBy, setSortBy] = useState("Latest")

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return setFilteredComponents(components)
    setFilteredComponents(
      components.filter((c) => c.name.toLowerCase().includes(q)),
    )
  }, [searchQuery, components])

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
      <Sidebar activeTeam={activeTeam} username={username} />
      <main className='relative flex-1 flex flex-col min-w-0 overflow-hidden'>
        <ProtectedNavbar
          breadcrumbs={[activeTeam?.name, "Components"]}
          onBreadcrumbClick={(i) => {
            if (i === 0) navigate("/teams")
          }}
        />

        <div className='flex-1 px-8 pt-6 pb-8 flex flex-col items-start'>
          <div className='mb-[2rem]'>
            <h3>Components</h3>
          </div>

          <div className='flex items-center gap-3 mb-[2rem] justify-between w-full'>
            <div className='flex flex-row gap-[0.5rem]'>
              <Dropdown
                value={sortBy}
                options={["Latest", "Newest", "All"]}
                onChange={setSortBy}
              />
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className='flex flex-row gap-[0.5rem]'>
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

          {filteredComponents.length === 0 ? (
            <div className='flex items-center justify-center h-48 text-gray-400 text-sm w-full'>
              No components in this team yet
            </div>
          ) : viewMode === "grid" ? (
            <div className='flex flex-wrap gap-4'>
              {filteredComponents.map((component, i) => (
                <DashboardCard
                  key={i}
                  header={component.name}
                  body={component.description}
                  thumbnail={component.thumbnail}
                  last_updated={component.last_updated}
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
            <div className='w-full'>
              <div className='grid grid-cols-[180px_1fr_220px] border-b border-gray-200 pb-2 mb-1'>
                <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                  Image
                </span>
                <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                  Title
                </span>
                <span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                  Last Edited
                </span>
              </div>
              {filteredComponents.map((component, i) => (
                <DashboardList
                  key={i}
                  name={component.name}
                  thumbnail={component.thumbnail}
                  user={component.user}
                  last_updated={component.last_updated}
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
