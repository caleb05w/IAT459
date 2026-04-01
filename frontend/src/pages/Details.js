import {useContext, useState} from "react"
import {useLocation, useNavigate} from "react-router-dom"
import {LuChevronDown} from "react-icons/lu"
import {AuthContext} from "../context/AuthContext"
import {DataContext} from "../context/DataContext"
import Sidebar from "../components/Sidebar"
import ProtectedNavbar from "../components/ProtectedNavbar"

const PORT = 5001

function formatDateTime(dateStr) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function Details() {
  const {state} = useLocation()
  const navigate = useNavigate()
  const {token} = useContext(AuthContext)
  const {teams, activeTeam, setActiveTeam} = useContext(DataContext)

  const {component} = state || {}
  const username = useContext(AuthContext).user?.username || ""

  const [activeNav, setActiveNav] = useState("Components")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isPublic, setIsPublic] = useState(component?.public ?? false)
  const [visibilityOpen, setVisibilityOpen] = useState(false)
  const [visibilityLoading, setVisibilityLoading] = useState(false)

  //handles visibility change update.
  const handleVisibilityChange = async (value) => {
    setVisibilityLoading(true)
    setVisibilityOpen(false)
    try {
      // prefer the activeTeam passed via router state.
      // if arriving from Marketplace, activeTeam is null, so fall back to
      // component.team which is always stored on the component document itself.
      const teamId = activeTeam?._id ?? component.team

      // POST to the visibility route with the new public value (true or false)
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${teamId}/components/${component._id}/visibility`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // attach JWT so the backend can verify who is making the request
          },
          body: JSON.stringify({public: value}), // send the new visibility value
        },
      )

      // only update local state if the backend confirmed the change
      if (res.ok) setIsPublic(value)
      else console.warn("Failed to update visibility")
    } catch (e) {
      console.warn("Error updating visibility", e)
    }
    setVisibilityLoading(false)
  }

  //if for some reason there is no component [?] just kill this lol
  if (!component) {
    navigate("/")
    return null
  }

  return (
    <div className='min-h-screen flex bg-white'>
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        activeTeam={activeTeam}
        setActiveTeam={setActiveTeam}
        teams={teams}
        username={username}
      />
      <main className='flex-1 flex flex-col min-w-0'>
        <ProtectedNavbar
          breadcrumbs={[activeTeam?.name, "Components", component.name]}
          onBreadcrumbClick={(i) => {
            if (i === 0 || i === 1) navigate(`/team/${activeTeam._id}`);
          }}
        />

        {/* Content */}
        <div className='flex-1 px-8 pt-8 pb-10 flex flex-col gap-8 bg-transparent'>
          {/* Preview */}
          <div
            className='w-full rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center'
            style={{minHeight: "360px"}}>
            {component.thumbnail ? (
              <img
                src={component.thumbnail}
                alt={component.name}
                className='max-w-full max-h-[480px] object-contain'
              />
            ) : (
              <span className='text-gray-300 text-sm'>
                No preview available
              </span>
            )}
          </div>

          {/* Info */}
          <div className='flex flex-col gap-5 max-w-2xl'>
            <div>
              <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-1'>
                Component Name
              </p>
              <h1 className='text-2xl font-semibold text-gray-900'>
                {component.name}
              </h1>
            </div>

            <div>
              <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-1'>
                Description
              </p>
              <p className='text-sm text-gray-600 leading-relaxed'>
                {component.description || "No description provided."}
              </p>
            </div>

            <div>
              <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-1'>
                Last Updated
              </p>
              <p className='text-sm text-gray-600'>
                {formatDateTime(component.last_updated)}
              </p>
            </div>

            <div>
              <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-1'>
                Visibility
              </p>
              <div className='relative w-fit'>
                <button
                  onClick={() => setVisibilityOpen((v) => !v)}
                  disabled={visibilityLoading}
                  className='flex items-center gap-6 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors min-w-[130px] justify-between disabled:opacity-50'>
                  {visibilityLoading
                    ? "Saving…"
                    : isPublic
                      ? "Public"
                      : "Private"}
                  <LuChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${visibilityOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {visibilityOpen && (
                  <div className='absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md z-10 overflow-hidden'>
                    {[
                      {label: "Public", value: true},
                      {label: "Private", value: false},
                    ].map(({label, value}) => (
                      <button
                        key={label}
                        onClick={() => handleVisibilityChange(value)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          isPublic === value
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className='w-fit flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors'>
              {showAdvanced ? "Hide Advanced Details" : "Advanced Details"}
            </button>

            {showAdvanced && (
              <div className='rounded-xl border border-gray-200 overflow-hidden'>
                <table className='w-full text-sm'>
                  <tbody>
                    {Object.entries(component).map(([key, value]) => (
                      <tr
                        key={key}
                        className='border-b border-gray-100 last:border-0'>
                        <td className='px-4 py-2.5 text-gray-400 font-mono text-xs w-40 shrink-0 align-top'>
                          {key}
                        </td>
                        <td className='px-4 py-2.5 text-gray-700 font-mono text-xs break-all'>
                          {value === null || value === undefined ? (
                            <span className='text-gray-300'>null</span>
                          ) : typeof value === "boolean" ? (
                            String(value)
                          ) : (
                            String(value)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  )
}
