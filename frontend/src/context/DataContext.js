import {createContext, useContext, useEffect, useRef, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "./AuthContext"

export const DataContext = createContext()

const PORT = 5001

export function DataProvider({children}) {
  const {token, logout} = useContext(AuthContext)
  const navigate = useNavigate()

  const [teams, setTeams] = useState([])
  const [activeTeam, setActiveTeam] = useState(null)
  const [components, setComponents] = useState([])

  // Cache: teamId -> components[]
  const componentsCache = useRef({})

  // Load teams once when token is available
  useEffect(() => {
    if (!token) return
    loadTeams()
  }, [token])

  // Load components when active team changes — use cache if available
  useEffect(() => {
    if (!activeTeam) return
    const cached = componentsCache.current[activeTeam._id]
    if (cached) {
      setComponents(cached)
    } else {
      fetchComponents(activeTeam._id)
    }
  }, [activeTeam?._id])

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
      }
    } catch (e) {
      console.warn("Error fetching teams", e)
    }
  }

  const fetchComponents = async (teamId) => {
    try {
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${teamId}/sync`,
        {method: "POST", headers: {Authorization: `Bearer ${token}`}},
      )
      const data = await res.json()
      if (res.ok) {
        componentsCache.current[teamId] = data
        setComponents(data)
      } else if (res.status === 401) {
        logout()
        navigate("/login")
      }
    } catch (e) {
      console.warn("Error fetching components", e)
    }
  }

  // Re-fetches teams and components from the server, updating the cache
  const refresh = async () => {
    try {
      const teamsRes = await fetch(`http://localhost:${PORT}/api/teams`, {
        headers: {Authorization: `Bearer ${token}`},
      })
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json()
        setTeams(teamsData)
      } else if (teamsRes.status === 401) {
        logout()
        navigate("/login")
        return
      }

      if (activeTeam) {
        const compRes = await fetch(
          `http://localhost:${PORT}/api/teams/${activeTeam._id}/sync`,
          {method: "POST", headers: {Authorization: `Bearer ${token}`}},
        )
        if (compRes.ok) {
          const compData = await compRes.json()
          componentsCache.current[activeTeam._id] = compData
          setComponents(compData)
        }
      }
    } catch (e) {
      console.warn("Error refreshing data", e)
    }
  }

  const createTeam = async ({name, externalId}) => {
    try {
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

  return (
    <DataContext.Provider
      value={{teams, activeTeam, setActiveTeam, components, refresh, createTeam}}>
      {children}
    </DataContext.Provider>
  )
}
