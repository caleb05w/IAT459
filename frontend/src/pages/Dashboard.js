import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import { LuRefreshCw } from "react-icons/lu"
import Button from "../components/Button"
import DashboardCard from "../components/DashboardCard"
import AddItemDropdown from "../components/AddItemDropdown"
import Sidebar from "../components/Sidebar"

const FILTERS = ["All", "In Review", "Developing", "Redesign"]
const PORT = 5001

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [items, setItems] = useState([])
  const [item, setItem] = useState({ name: "", description: "", color: "" })
  const [activeNav, setActiveNav] = useState("Recents")
  const [activeTeam, setActiveTeam] = useState("Team 1")
  const [activeFilter, setActiveFilter] = useState("All")
  const [refreshing, setRefreshing] = useState(false)

  const loadItems = async () => {
    try {
      const res = await fetch(`http://localhost:${PORT}/api/items/dashboard`, {
        method: "GET",
      })
      const loadedItems = await res.json()
      if (res.ok) {
        setItems(loadedItems)
        console.log("data fetched", loadedItems)
      } else {
        console.warn("network rejected pull")
      }
    } catch (e) {
      console.warn("issue fetching items", e)
    }
  }

  const saveItems = async (item) => {
    try {
      await fetch(`http://localhost:${PORT}/api/items/dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: item.name,
          description: item.description,
          color: item.color,
        }),
      })
    } catch (e) {
      console.warn("issue saving items", e)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadItems().finally(() => setRefreshing(false))
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    if (token) {
      const user = jwtDecode(token)
      setUsername(user.username)
    } else {
      console.log("no user detected, or no token")
    }
  }, [token])

  const filteredItems = activeFilter === "All"
    ? items
    : items.filter((c) => c.status === activeFilter)

  return (
    <div className="min-h-screen flex bg-[#f5f5f3]">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        activeTeam={activeTeam}
        setActiveTeam={setActiveTeam}
        username={username}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
          <span className="text-[18px] text-gray-800 font-medium">Dashboard</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <LuRefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Button body="Logout" onClick={handleLogout} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 pt-6 pb-8">
          {/* Greeting + team title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome, {username}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{activeTeam}</p>
          </div>

          <div className="border-b border-gray-200 mb-6" />

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                  ${activeFilter === f
                    ? "bg-white border-gray-400 text-gray-900 shadow-sm"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 bg-transparent"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-4 mb-12">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, i) => (
                <DashboardCard
                  key={i}
                  header={item.name}
                  body={item.description}
                  color={item.color}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No items detected
              </div>
            )}
          </div>

          {/* Add item form */}
          <AddItemDropdown item={item} setItem={setItem} onSave={saveItems} />
        </div>
      </main>
    </div>
  )
}
