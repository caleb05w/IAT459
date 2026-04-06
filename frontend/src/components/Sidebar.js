import React, {useContext} from "react"
import {toSlug} from "../utils/toSlug"
import {useNavigate} from "react-router-dom"
import {DataContext} from "../context/DataContext"
import {
  LuHouse,
  LuLayoutGrid,
  LuBookmark,
  LuSettings,
  LuStore,
  LuChevronRight,
} from "react-icons/lu"

const NAV_ITEMS = [
  {label: "Overview", icon: LuHouse, path: "/"},
  {label: "Marketplace", icon: LuStore, path: "/marketplace"},
  {label: "Bookmarks", icon: LuBookmark, path: "/bookmarks"},
  {label: "Components", icon: LuLayoutGrid, path: "/:teamid"},
  {label: "Team Settings", icon: LuSettings, path: "/settings"},
]

export default function Sidebar({
  activeNav,
  setActiveNav,
  activeTeam,
  username,
}) {
  const {currentUserRole} = useContext(DataContext)
  const navigate = useNavigate()

  // exists to limit certain options for different users
  const visibleNavItems = NAV_ITEMS.filter(
    // ({label}) => label !== "Team Settings" || currentUserRole !== "Collaborator",
    () => true,
  )

  const handleNavClick = (label, path) => {
    setActiveNav?.(label)
    if (label === "Overview") {
      navigate("/teams")
    } else if (label === "Components" && activeTeam) {
      navigate(`/team/${toSlug(activeTeam.name)}`)
    } else if (label === "Team Settings" && activeTeam) {
      navigate(`/team/${toSlug(activeTeam.name)}/settings`)
    } else if (path) {
      navigate(path)
    }
  }

  return (
    <>
      <div className='w-56 shrink-0' />
      <aside className='fixed top-0 left-0 w-56 h-screen bg-white flex flex-col border-r border-gray-100 z-40'>
        {/* Brand */}
        <div
          className='px-[1.5rem] pt-5 pb-3 cursor-pointer'
          onClick={() => navigate("/teams")}>
          <h3>{activeTeam?.name || "IAT459"}</h3>
        </div>

        {/* Nav items */}
        <nav className='flex-1 px-3 pt-2 flex flex-col gap-[0.25rem]'>
          {visibleNavItems.map(({label, icon: Icon, path}) => (
            <React.Fragment key={label}>
              {label === "Components" && (
                <div className='my-1 border-t border-gray-200' />
              )}
              <button
                onClick={() => handleNavClick(label, path)}
                className={`w-full flex items-center gap-[0.5rem] px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  activeNav === label
                    ? "text-black"
                    : "text-secondary hover:text-black"
                }`}>
                <Icon className='w-4 h-4 shrink-0' />
                {label}
              </button>
            </React.Fragment>
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
        <button className='mx-3 mb-3 px-3 py-2.5 rounded-xl border border-gray-100 flex items-center gap-3 w-[calc(100%-1.5rem)] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group'>
          <div className='w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-xs shrink-0'>
            {username ? username[0].toUpperCase() : "?"}
          </div>
          <div className='min-w-0 text-left flex-1'>
            <p className='text-sm font-medium text-gray-700 truncate'>
              {username || "..."}
            </p>
            <p className='text-xs text-gray-400'>
              {currentUserRole || "..."}
            </p>
          </div>
          <LuChevronRight className='w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0' />
        </button>
      </aside>
    </>
  )
}
