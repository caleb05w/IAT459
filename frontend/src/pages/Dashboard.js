import {useContext, useEffect, useState} from "react"
import {AuthContext} from "../context/AuthContext"
import {useNavigate} from "react-router-dom"
import {jwtDecode} from "jwt-decode"
import {LuRefreshCw} from "react-icons/lu"

// imported components
import Button from "../components/Button"
import DashboardCard from "../components/DashboardCard"
import Sidebar from "../components/Sidebar"
import CreateTeamModal from "../components/CreateTeamModal"
import {extractTeamId} from "../utils/extractTeamId"
import SearchBar from "../components/SearchBar"

const PORT = 5001

export default function Dashboard() {
  const {token, logout} = useContext(AuthContext)
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
        {method: "POST", headers: {Authorization: `Bearer ${token}`}},
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
  const createTeam = async ({name, url}) => {
    try {
      const externalId = extractTeamId(url)
      console.log(externalId)
      const res = await fetch(`http://localhost:${PORT}/api/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({name, externalId}),
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
    // spin the refresh icon while fetching
    setRefreshing(true)

    const fetches = [
      //re-fetch the team list so sidebar stays up to date
      fetch(`http://localhost:${PORT}/api/teams`, {
        headers: {Authorization: `Bearer ${token}`},
      }).then((r) => {
        // expired token — kick the user back to login
        if (r.status === 401) {
          logout()
          navigate("/login")
          return
        }
        return r.json().then((data) => setTeams(data))
      }),

      // re-sync Figma components for the active team (if one is selected)
      activeTeam
        ? fetch(`http://localhost:${PORT}/api/teams/${activeTeam._id}/sync`, {
            method: "POST",
            headers: {Authorization: `Bearer ${token}`},
          }).then((r) => {
            if (r.status === 401) {
              logout()
              navigate("/login")
              return
            }
            return r.json().then((data) => setComponents(data))
          })
        : Promise.resolve(), // no active team -> no sync
    ]

    // stop the spinner once both fetches settle
    Promise.all(fetches).finally(() => setRefreshing(false))
  }

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // ── Effects ───────────────────────────────────────────────

  // load teams — defined inside effect so token is always fresh
  useEffect(() => {
    if (!token) return

    const loadTeams = async () => {
      try {
        const res = await fetch(`http://localhost:${PORT}/api/teams`, {
          headers: {Authorization: `Bearer ${token}`},
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

  // decode username from token
  useEffect(() => {
    if (token) {
      const user = jwtDecode(token)
      setUsername(user.username)
    }
  }, [token])

  // load components when active team changes
  useEffect(() => {
    if (activeTeam) loadComponents(activeTeam._id)
  }, [activeTeam])

  // reset filtered list whenever components update
  useEffect(() => {
    setFilteredComponents(components)
    setSearchQuery("")
  }, [components])

  // ── Render ────────────────────────────────────────────────
  return (
    <div className='min-h-screen flex bg-[#f5f5f3]'>
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
        <div className='flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white'>
          <span className='text-[18px] text-gray-800 font-medium'>
            Dashboard
          </span>
          <div className='flex items-center gap-3'>
            <button
              onClick={handleRefresh}
              className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm'>
              <LuRefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <Button body='Logout' onClick={handleLogout} />
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 px-8 pt-6 pb-8'>
          <div className='mb-6'>
            <h1 className='text-2xl font-semibold text-gray-900'>
              Welcome, {username}
            </h1>
            <p className='text-sm text-gray-400 mt-0.5'>
              {activeTeam ? activeTeam.name : "No team selected"}
            </p>
          </div>

          <div className='border-b border-gray-200 mb-6' />

          {activeTeam && (
            <div className='mb-6'>
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          )}

          {!activeTeam ? (
            <div className='flex items-center justify-center h-48 text-gray-400 text-sm'>
              Select or create a team to get started
            </div>
          ) : filteredComponents.length > 0 ? (
            <div className='flex flex-wrap gap-4'>
              {filteredComponents.map((component, i) => (
                <DashboardCard
                  key={i}
                  header={component.name}
                  body={component.description}
                  thumbnail={component.thumbnail}
                  last_updated={component.last_updated}
                />
              ))}
            </div>
          ) : (
            <div className='flex items-center justify-center h-48 text-gray-400 text-sm'>
              No components in this team yet
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
