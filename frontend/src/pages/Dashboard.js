import {useContext, useEffect, useState} from "react"
import {AuthContext} from "../context/AuthContext"
import {useNavigate} from "react-router-dom"
import {jwtDecode} from "jwt-decode"
import {LuRefreshCw} from "react-icons/lu"
import Button from "../components/Button"
import DashboardCard from "../components/DashboardCard"
import Sidebar from "../components/Sidebar"
import CreateTeamModal from "../components/CreateTeamModal"
import {extractTeamId} from "../utils/extractTeamId"

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

  // ── Load components for active team ───────────────────────
  const loadComponents = async (teamId) => {
    try {
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${teamId}/components`,
        {headers: {Authorization: `Bearer ${token}`}},
      )
      const data = await res.json()
      if (res.ok) {
        setComponents(data)
      } else if (res.status === 401) {
        logout()
        navigate("/login")
      } else {
        console.warn("Failed to fetch components:", data.error)
      }
    } catch (e) {
      console.warn("issue fetching components", e)
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
    setRefreshing(true)
    const fetches = [
      fetch(`http://localhost:${PORT}/api/teams`, {
        headers: {Authorization: `Bearer ${token}`},
      }).then((r) => {
        if (r.status === 401) {
          logout()
          navigate("/login")
          return
        }
        return r.json().then((data) => setTeams(data))
      }),
      activeTeam
        ? fetch(
            `http://localhost:${PORT}/api/teams/${activeTeam._id}/components`,
            {headers: {Authorization: `Bearer ${token}`}},
          ).then((r) => {
            // If token expires logout
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

          {!activeTeam ? (
            <div className='flex items-center justify-center h-48 text-gray-400 text-sm'>
              Select or create a team to get started
            </div>
          ) : components.length > 0 ? (
            <div>
              {components.map((component, i) => (
                <DashboardCard
                  key={i}
                  header={component.name}
                  body={component.description}
                  color={component.color}
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
