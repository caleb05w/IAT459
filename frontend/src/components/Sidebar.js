import {useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {DataContext} from "../context/DataContext"
import {
  LuHouse,
  LuLayoutGrid,
  LuBookmark,
  LuSettings,
  LuChevronRight,
  LuArrowLeft,
  LuPlus,
} from "react-icons/lu"

const NAV_ITEMS = [
  {label: "Overview", icon: LuHouse, path: "/"},
  {label: "Components", icon: LuLayoutGrid, path: "/"},
  {label: "Bookmarks", icon: LuBookmark, path: null},
  {label: "Team Settings", icon: LuSettings, path: "/settings"},
]

export default function Sidebar({
  activeNav,
  setActiveNav,
  activeTeam,
  setActiveTeam,
  teams = [],
  username,
  setShowCreateTeam,
}) {
  const {currentUserRole} = useContext(DataContext)
  const navigate = useNavigate()
  const [teamOpen, setTeamOpen] = useState(false)

  const visibleNavItems = NAV_ITEMS.filter(
    ({label}) =>
      label !== "Team Settings" || currentUserRole !== "Collaborator",
  )

  const handleNavClick = (label, path) => {
    setActiveNav(label)
    if (path) navigate(path)
  }

  return (
    <aside className='w-56 h-screen bg-white flex flex-col border-r border-gray-100 shrink-0'>
      {/* Brand / Team selector */}
      <div className='px-4 pt-5 pb-3 relative'>
        <button
          onClick={() => setTeamOpen(!teamOpen)}
          className='w-full flex items-center justify-between gap-2'>
          <div className='flex items-center gap-2.5'>
            <span className='text-sm font-semibold text-gray-800 truncate'>
              {activeTeam?.name}
            </span>
          </div>
          <LuChevronRight
            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${teamOpen ? "rotate-90" : ""}`}
          />
        </button>

        {teamOpen && (
          <div className='absolute left-4 right-4 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50'>
            {teams.length > 0 ? (
              teams.map((team) => (
                <button
                  key={team._id}
                  onClick={() => {
                    setActiveTeam(team)
                    setTeamOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    activeTeam?._id === team._id
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}>
                  {team.name}
                </button>
              ))
            ) : (
              <div className='px-4 py-3 text-sm text-gray-400'>
                No teams yet
              </div>
            )}
            <div className='border-t border-gray-100'>
              <button
                onClick={() => {
                  setTeamOpen(false)
                  setShowCreateTeam?.(true)
                }}
                className='w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors'>
                <LuPlus className='w-4 h-4' />
                Create new
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className='flex-1 px-3 pt-2 flex flex-col gap-0.5'>
        {visibleNavItems.map(({label, icon: Icon, path}) => (
          <button
            key={label}
            onClick={() => handleNavClick(label, path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
              activeNav === label
                ? "text-gray-900 font-semibold"
                : "text-gray-400 hover:text-gray-600"
            }`}>
            <Icon className='w-4 h-4 shrink-0' />
            {label}
          </button>
        ))}
      </nav>

      {/* Go Back */}
      {/* <div className='px-3 pb-4'>
        <button className='flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 cursor-default'>
          <LuArrowLeft className='w-4 h-4' />
          Go Back
        </button>
      </div> */}

      {/* User footer */}
      <div className='px-4 py-4 border-t border-gray-100 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-xs shrink-0'>
            {username ? username[0].toUpperCase() : "?"}
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-medium text-gray-700 truncate'>
              {username || "..."}
            </p>
            <p className='text-xs text-gray-400'>Administrator</p>
          </div>
        </div>
        <button className='text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0'>
          ···
        </button>
      </div>
    </aside>
  )
}
