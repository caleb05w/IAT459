// need to fetch token from authProvider
import {useContext, useEffect, useState} from "react"
import {AuthContext} from "../context/AuthContext"
import {useNavigate} from "react-router-dom"
import Button from "../components/Button"
import DashboardCard from "../components/DashboardCard"
//use this to decode the token.
import {jwtDecode} from "jwt-decode"
import AddItemDropdown from "../components/AddItemDropdown"

export default function Dashboard() {
  const {token, logout} = useContext(AuthContext)
  const navigate = useNavigate()
  const [username, setUsername] = useState("")

  const [items, setItems] = useState([])
  const [item, setItem] = useState({name: "", description: "", color: ""})
  const PORT = 5001

  const loaditems = async () => {
    try {
      const res = await fetch(`http://localhost:${PORT}/api/items/dashboard`, {
        method: "GET",
      })

      const loadeditems = await res.json()

      if (res.ok) {
        setItems(loadeditems)
        console.log("data fetched", loadeditems)
      } else {
        console.warn("network rejected pull")
      }
    } catch (e) {
      console.warn("issue fetching items", e)
    }
  }

  const saveitems = async (item) => {
    try {
      const res = await fetch(`http://localhost:${PORT}/api/items/dashboard`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
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

  useEffect(() => {
    loaditems()
  }, [])

  useEffect(() => {
    if (token) {
      const user = jwtDecode(token)
      setUsername(user.username)
    } else {
      console.log("no user detected, or no token")
    }
  }, [token])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      {/* Header bar */}
      <div className='flex items-center px-6 h-[88px] border-b border-gray-100'>
        <span className='text-[18px] text-black'>Dashboard</span>
      </div>

      {/* Main content */}
      <div className='flex flex-col gap-16 pl-16 pr-48 pt-6 pb-6 flex-1'>
        {/* Greeting */}
        <div className='flex items-center justify-between'>
          <h1 className='text-[24px] font-medium text-black'>
            Welcome, {username}
          </h1>
          <Button body='Logout' onClick={handleLogout} />
        </div>

        {/* Cards */}
        <div className='flex flex-col gap-4'>
          {items.length > 0 ? (
            items.map((items, i) => (
              <DashboardCard
                key={i}
                header={items.name}
                body={items.description}
                color={items.color}
              />
            ))
          ) : (
            <div className=''>No items detected</div>
          )}
        </div>

        {/* New items Form */}
        <AddItemDropdown item={item} setItem={setItem} onSave={saveitems} />
      </div>
    </div>
  )
}
