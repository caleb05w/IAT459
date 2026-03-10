import {useState} from "react"
import {
  LuClock,
  LuBookmark,
  LuLayoutGrid,
  LuChevronDown,
  LuPlus,
  LuSearch,
} from "react-icons/lu"

// temp
const NAV_ITEMS = [
  {label: "Recents", icon: LuClock},
  {label: "Bookmarked", icon: LuBookmark},
  {label: "All Components", icon: LuLayoutGrid},
]

export default function Sidebar({
  activeNav,
  setActiveNav,
  activeTeam,
  setActiveTeam,
  teams = [], // user's teams
  username,
  setShowCreateTeam,
}) {
  const [teamOpen, setTeamOpen] = useState(false)

  return (
    <aside className='w-60 h-screen bg-white flex flex-col border-r border-gray-100 shrink-0'>
      {/* Top actions */}
      <div className='px-3 pt-4 pb-3 border-b border-gray-100'>
        <button
          className='w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors'
          onClick={() => setShowCreateTeam(true)}>
          <LuPlus className='w-4 h-4' />
          Create New Team
        </button>
      </div>

      {/* Search */}
      <div className='px-3 py-3'>
        <div className='flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2'>
          <LuSearch className='w-3.5 h-3.5 text-gray-400 shrink-0' />
          <span className='text-gray-400 text-sm flex-1'>Search</span>
          <kbd className='text-gray-400 text-xs border border-gray-200 rounded px-1 py-0.5 font-mono'>
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Team selector */}
      <div className='px-3 pb-2'>
        <button
          onClick={() => setTeamOpen(!teamOpen)}
          className='w-full flex items-center justify-between px-3 py-2.5 bg-gray-100 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors'>
          <span>{activeTeam ? activeTeam.name : "Select a team"}</span>
          <LuChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${teamOpen ? "rotate-180" : ""}`}
          />
        </button>

        {teamOpen && (
          <div className='mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden'>
            {teams.length > 0 ? (
              teams.map((team) => (
                <button
                  key={team._id}
                  onClick={() => {
                    setActiveTeam(team)
                    setTeamOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                    ${
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
          </div>
        )}
      </div>

      {/* Divider */}
      <div className='mx-3 border-t border-gray-100' />

      {/* Nav items */}
      <nav className='flex-1 px-3 py-3 flex flex-col gap-0.5'>
        {NAV_ITEMS.map(({label, icon: Icon}) => (
          <button
            key={label}
            onClick={() => setActiveNav(label)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left
              ${
                activeNav === label
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}>
            <Icon className='w-4 h-4 shrink-0' />
            {label}
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div className='px-4 py-4 border-t border-gray-100 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-xs shrink-0'>
            {username ? username[0].toUpperCase() : "?"}
          </div>
          <span className='text-sm font-medium text-gray-700'>
            {username || "..."}
          </span>
        </div>
        <button className='text-gray-400 hover:text-gray-600 text-lg leading-none'>
          ···
        </button>
      </div>
    </aside>
  )
}
