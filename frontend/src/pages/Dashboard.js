import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import { LuRefreshCw, LuLayoutGrid, LuList, LuChevronDown } from "react-icons/lu"

// imported components
import Button from "../components/Button"
import DashboardCard from "../components/DashboardCard"
import Sidebar from "../components/Sidebar"
import CreateTeamModal from "../components/CreateTeamModal"
import { extractTeamId } from "../utils/extractTeamId"
import SearchBar from "../components/SearchBar"
import DashboardList from "../components/DashboardList"

const PORT = 5001


export default function Dashboard() {
  const { token, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [teams, setTeams] = useState([])
  const [activeNav, setActiveNav] = useState("Recents")
  const [activeTeam, setActiveTeam] = useState(null)
  const [components, setComponents] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredComponents, setFilteredComponents] = useState([])

  //default view grid
  const [viewMode, setViewMode] = useState("grid")
  //search dropdown
  const [sortBy, setSortBy] = useState("Latest")
  const [sortOpen, setSortOpen] = useState(false)

  // ── Search — filters live as the user types ───────────────
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return setFilteredComponents(components)
    setFilteredComponents(
      components.filter((c) => c.name.toLowerCase().includes(q)),
    )
  }, [searchQuery, components])

  // ── Sync + load components for active team ────────────────
  const loadComponents = async (teamId) => {
    try {
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${teamId}/sync`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      )
      const data = await res.json()
      if (res.ok) {
        setComponents(data)
      } else if (res.status === 401) {
        logout()
        navigate("/login")
      } else {
        console.warn("Failed to sync components:", data.error)
      }
    } catch (e) {
      console.warn("issue syncing components", e)
    }
  }

  // ── Create team ───────────────────────────────────────────
  const createTeam = async ({ name, url }) => {
    try {
      const externalId = extractTeamId(url)
      console.log(externalId)
      const res = await fetch(`http://localhost:${PORT}/api/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, externalId }),
      })
      const data = await res.json()
      if (res.ok) {
        setTeams((prev) => [...prev, data])
        setActiveTeam(data)
      } else {
        console.warn("Failed to create team:", data.message)
      }
    } catch (e) {
      console.warn("Error creating team:", e)
    }
  }

  // ── Refresh ───────────────────────────────────────────────
  const handleRefresh = () => {
    setRefreshing(true)

    const fetches = [
      fetch(`http://localhost:${PORT}/api/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => {
        if (r.status === 401) {
          logout()
          navigate("/login")
          return
        }
        return r.json().then((data) => setTeams(data))
      }),

      activeTeam
        ? fetch(`http://localhost:${PORT}/api/teams/${activeTeam._id}/sync`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => {
          if (r.status === 401) {
            logout()
            navigate("/login")
            return
          }
          return r.json().then((data) => setComponents(data))
        })
        : Promise.resolve(),
    ]

    Promise.all(fetches).finally(() => setRefreshing(false))
  }

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => {
    if (!token) return

    const loadTeams = async () => {
      try {
        const res = await fetch(`http://localhost:${PORT}/api/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setTeams(data)
          setActiveTeam((prev) => prev ?? data[0] ?? null)
        } else if (res.status === 401) {
          logout()
          navigate("/login")
        } else {
          console.warn("Failed to fetch teams:", data.error)
        }
      } catch (e) {
        console.warn("issue fetching teams", e)
      }
    }

    loadTeams()
  }, [token, logout, navigate])

  useEffect(() => {
    if (token) {
      const user = jwtDecode(token)
      setUsername(user.username)
    }
  }, [token])

  useEffect(() => {
    if (activeTeam) loadComponents(activeTeam._id)
  }, [activeTeam])

  useEffect(() => {
    setFilteredComponents(components)
    setSearchQuery("")
  }, [components])

  // ── Render ────────────────────────────────────────────────
  return (
    <div className='min-h-screen flex bg-white'>
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        activeTeam={activeTeam}
        setActiveTeam={setActiveTeam}
        teams={teams}
        username={username}
        setShowCreateTeam={setShowCreateTeam}
      />

      <main className='flex-1 flex flex-col min-w-0'>
        {/* Topbar */}
        <div className='flex items-center justify-between px-8 py-3 border-b border-gray-100 bg-white'>
          <span className='text-sm text-gray-400'>
            Figma /{" "}
            <span className='text-gray-900 font-semibold'>Components</span>
          </span>
          <div className='flex items-center gap-3'>
            <button
              onClick={handleRefresh}
              className='flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors'>
              <LuRefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <Button body='Logout' onClick={handleLogout} />
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 px-8 pt-6 pb-8'>
          {activeTeam && (
            <>
              {/* Controls row: sort dropdown + search */}
              <div className='flex items-center gap-3 mb-4'>
                <div className='relative'>
                  <button
                    onClick={() => setSortOpen((o) => !o)}
                    className='flex items-center gap-6 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors min-w-[130px] justify-between'>
                    {sortBy}
                    <LuChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {sortOpen && (
                    <div className='absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md z-10 overflow-hidden'>
                      {["Latest", "Newest", "All"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option)
                            setSortOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sortBy === option
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}>
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className='flex-1'>
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>
              </div>

              {/* Count + view toggle row */}
              <div className='flex items-center justify-between mb-4'>
                <span className='text-sm text-gray-500'>
                  Showing All ({filteredComponents.length})
                </span>
                <div className='flex items-center gap-1'>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${viewMode === "grid"
                      ? "bg-gray-100 border-gray-300 text-gray-800 font-medium"
                      : "border-gray-200 text-gray-400 hover:bg-gray-50"
                      }`}>
                    <LuLayoutGrid className='w-3.5 h-3.5' />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${viewMode === "list"
                      ? "bg-gray-100 border-gray-300 text-gray-800 font-medium"
                      : "border-gray-200 text-gray-400 hover:bg-gray-50"
                      }`}>
                    <LuList className='w-3.5 h-3.5' />
                    List
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Component display */}
          {!activeTeam ? (
            <div className='flex items-center justify-center h-48 text-gray-400 text-sm'>
              Select or create a team to get started
            </div>
          ) : filteredComponents.length === 0 ? (
            <div className='flex items-center justify-center h-48 text-gray-400 text-sm'>
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
                />
              ))}
            </div>
          ) : (
            /* List view */
            <div className='w-full'>
              {/* Table header */}
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
                  link={component.link}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateTeam && (
        <CreateTeamModal
          onClose={() => setShowCreateTeam(false)}
          onSubmit={createTeam}
        />
      )}
    </div>
  )
}
