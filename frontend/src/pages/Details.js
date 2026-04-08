import {useContext, useState} from "react"
import {useLocation, useNavigate} from "react-router-dom"
import {AuthContext} from "../context/AuthContext"
import {DataContext} from "../context/DataContext"
import Sidebar from "../components/Sidebar"
import ProtectedNavbar from "../components/ProtectedNavbar"
import Button from "../components/Button"
import Dropdown from "../components/Dropdown"

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
  const [visibilityLoading, setVisibilityLoading] = useState(false)
  const [hasUpdate, setHasUpdate] = useState(component?.hasUpdate ?? false)
  const [liveComponent, setLiveComponent] = useState(component)
  const [acceptLoading, setAcceptLoading] = useState(false)

  //handles visibility change update.
  const handleVisibilityChange = async (value) => {
    setVisibilityLoading(true)
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

  const handleAccept = async () => {
    setAcceptLoading(true)
    try {
      const teamId = activeTeam?._id ?? liveComponent.team
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${teamId}/components/${liveComponent._id}/accept`,
        {method: "POST", headers: {Authorization: `Bearer ${token}`}},
      )
      if (res.ok) {
        const updated = await res.json()
        setLiveComponent(updated)
        setHasUpdate(false)
      } else {
        console.warn("Failed to accept update")
      }
    } catch (e) {
      console.warn("Error accepting update", e)
    }
    setAcceptLoading(false)
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
          breadcrumbs={[activeTeam?.name, "Components", liveComponent.name]}
          onBreadcrumbClick={(i) => {
            if (i === 0 || i === 1) navigate(`/team/${activeTeam._id}`);
          }}
        />

        {/* Content */}
        <div className='flex-1 px-8 pt-8 pb-10 flex flex-col gap-8 bg-transparent'>
<<<<<<< Updated upstream
=======
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
              <h6 className='text-gray-300'>No preview available</h6>
            )}
          </div>
>>>>>>> Stashed changes

          {/* Preview — side by side if hasUpdate, single if not */}
          {hasUpdate ? (
            <div className='flex gap-6 w-full'>
              {/* Current */}
              <div className='flex-1 flex flex-col gap-3'>
                <div className='flex items-center gap-2'>
                  <span className='px-2 py-0.5 rounded text-xs font-medium border border-gray-300 text-gray-600'>Current Version</span>
                </div>
                <div
                  className='w-full rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center'
                  style={{minHeight: "300px"}}>
                  {liveComponent.curr_thumbnail ? (
                    <img src={liveComponent.curr_thumbnail} alt='Current' className='max-w-full max-h-[400px] object-contain' />
                  ) : (
                    <span className='text-gray-300 text-sm'>No preview available</span>
                  )}
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-1'>Description</p>
                  <p className='text-sm text-gray-600 leading-relaxed'>{liveComponent.curr_description || "No description provided."}</p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-1'>Author</p>
                  <p className='text-sm text-gray-600'>{liveComponent.last_user}</p>
                </div>
              </div>

              {/* Incoming */}
              <div className='flex-1 flex flex-col gap-3'>
                <div className='flex items-center gap-2'>
                  <span className='px-2 py-0.5 rounded text-xs font-medium bg-black text-white'>Incoming Version</span>
                </div>
                <div
                  className='w-full rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center'
                  style={{minHeight: "300px"}}>
                  {liveComponent.inc_thumbnail ? (
                    <img src={liveComponent.inc_thumbnail} alt='Incoming' className='max-w-full max-h-[400px] object-contain' />
                  ) : (
                    <span className='text-gray-300 text-sm'>No preview available</span>
                  )}
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-1'>Description</p>
                  <p className='text-sm text-gray-600 leading-relaxed'>{liveComponent.inc_description || "No description provided."}</p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-1'>Author</p>
                  <p className='text-sm text-gray-600'>{liveComponent.inc_last_user}</p>
                </div>
                <button
                  onClick={handleAccept}
                  disabled={acceptLoading}
                  className='mt-2 w-fit px-4 py-2 rounded-full bg-black text-white text-sm hover:opacity-80 transition-opacity disabled:opacity-50'>
                  {acceptLoading ? "Accepting…" : "Accept Update"}
                </button>
              </div>
            </div>
          ) : (
            <div
              className='w-full rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center'
              style={{minHeight: "360px"}}>
              {liveComponent.curr_thumbnail ? (
                <img
                  src={liveComponent.curr_thumbnail}
                  alt={liveComponent.name}
                  className='max-w-full max-h-[480px] object-contain'
                />
              ) : (
                <span className='text-gray-300 text-sm'>No preview available</span>
              )}
            </div>
          )}

          {/* Info — only shown in single view */}
          {!hasUpdate && (
          <div className='flex flex-col gap-5 max-w-2xl'>
            <div>
              <h6 className='uppercase tracking-wide text-gray-400 mb-1'>
                Component Name
<<<<<<< Updated upstream
              </p>
              <h1 className='text-2xl font-semibold text-gray-900'>
                {liveComponent.name}
              </h1>
=======
              </h6>
              <h1 className='text-gray-900'>{component.name}</h1>
>>>>>>> Stashed changes
            </div>

            <div>
              <h6 className='uppercase tracking-wide text-gray-400 mb-1'>
                Description
<<<<<<< Updated upstream
              </p>
              <p className='text-sm text-gray-600 leading-relaxed'>
                {liveComponent.curr_description || "No description provided."}
=======
              </h6>
              <p className='text-gray-600'>
                {component.description || "No description provided."}
>>>>>>> Stashed changes
              </p>
            </div>

            <div>
              <h6 className='uppercase tracking-wide text-gray-400 mb-1'>
                Last Updated
<<<<<<< Updated upstream
              </p>
              <p className='text-sm text-gray-600'>
                {formatDateTime(liveComponent.curr_last_updated)}
=======
              </h6>
              <p className='text-gray-600'>
                {formatDateTime(component.last_updated)}
>>>>>>> Stashed changes
              </p>
            </div>

            <div>
              <h6 className='uppercase tracking-wide text-gray-400 mb-1'>
                Visibility
              </h6>
              <Dropdown
                value={visibilityLoading ? "Saving…" : isPublic ? "Public" : "Private"}
                options={["Public", "Private"]}
                onChange={(label) => handleVisibilityChange(label === "Public")}
              />
            </div>

            <Button
              body={showAdvanced ? "Hide Advanced Details" : "Advanced Details"}
              onClick={() => setShowAdvanced((v) => !v)}
              size='sm'
              style='secondary'
            />

            {showAdvanced && (
              <div className='rounded-xl border border-gray-200 overflow-hidden'>
                <table className='w-full text-sm'>
                  <tbody>
                    {Object.entries(liveComponent).map(([key, value]) => (
                      <tr
                        key={key}
                        className='border-b border-gray-100 last:border-0'>
                        <td className='px-4 py-2.5 text-gray-400 font-mono w-40 shrink-0 align-top'>
                          <h6>{key}</h6>
                        </td>
                        <td className='px-4 py-2.5 text-gray-700 font-mono break-all'>
                          <h6>
                            {value === null || value === undefined ? (
                              <span className='text-gray-300'>null</span>
                            ) : (
                              String(value)
                            )}
                          </h6>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}
        </div>
      </main>

    </div>
  )
}
