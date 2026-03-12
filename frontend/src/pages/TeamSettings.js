import {useContext, useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {LuChevronDown} from "react-icons/lu"
import {AuthContext} from "../context/AuthContext"
import {DataContext} from "../context/DataContext"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import SearchBar from "../components/SearchBar"
import CreateTeamModal from "../components/CreateTeamModal"
import {extractTeamId} from "../utils/extractTeamId"

const PORT = 5001
// Roles available when adding or reassigning a member (Owner is excluded — only transferable, not directly assignable)
const ROLES = ["Admin", "Collaborator"]

// Team settings page with two tabs: Settings (team config) and Members (member management)
export default function TeamSettings() {
  const {token} = useContext(AuthContext)
  const {teams, activeTeam, setActiveTeam, renameTeam, currentUserRole, createTeam} =
    useContext(DataContext)
  const username = useContext(AuthContext).user?.username || ""
  const navigate = useNavigate()

  const [showCreateTeam, setShowCreateTeam] = useState(false)

  const handleCreateTeam = async ({name, url}) => {
    const externalId = extractTeamId(url)
    await createTeam({name, externalId})
  }

  // --- Settings tab state ---
  const [activeTab, setActiveTab] = useState("Settings")
  const [teamName, setTeamName] = useState("")
  const [teamNameLoading, setTeamNameLoading] = useState(false)
  const [visibilityOpen, setVisibilityOpen] = useState(false)
  const [visibility, setVisibility] = useState("Private")
  const [visibilityLoading, setVisibilityLoading] = useState(false)

  // Keep the team name input in sync when the active team changes
  useEffect(() => {
    setTeamName(activeTeam?.name ?? "")
  }, [activeTeam?._id])

  // Send a PATCH request to rename the team; no-op if the name hasn't changed
  const handleRenameTeam = async () => {
    if (!teamName.trim() || teamName.trim() === activeTeam?.name) return
    setTeamNameLoading(true)
    await renameTeam(activeTeam._id, teamName.trim())
    setTeamNameLoading(false)
  }

  // --- Members tab state ---
  const [members, setMembers] = useState([])
  const [memberSearch, setMemberSearch] = useState("")
  const [openRoleDropdown, setOpenRoleDropdown] = useState(null) // tracks which member's role dropdown is open

  // Add Member modal state
  const [showAddMember, setShowAddMember] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newRole, setNewRole] = useState("Collaborator")
  const [newRoleOpen, setNewRoleOpen] = useState(false)
  const [addMemberLoading, setAddMemberLoading] = useState(false)
  const [addMemberError, setAddMemberError] = useState("")

  // Fetch members when the Members tab is opened or the active team changes
  useEffect(() => {
    if (!activeTeam || activeTab !== "Members") return
    fetch(`http://localhost:${PORT}/api/teams/${activeTeam._id}/members`, {
      headers: {Authorization: `Bearer ${token}`},
    })
      .then((r) => r.json())
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch((e) => console.warn("Error fetching members", e))
  }, [activeTeam, activeTab, token])

  // Client-side filter across username, first name, and last name --> for search
  const filteredMembers = members.filter((m) => {
    const q = memberSearch.toLowerCase()
    return (
      m.username?.toLowerCase().includes(q) ||
      m.fName?.toLowerCase().includes(q) ||
      m.lName?.toLowerCase().includes(q)
    )
  })

  // POST a new member by username + role; updates the member list on success
  const handleAddMember = async () => {
    if (!newUsername.trim()) return
    setAddMemberLoading(true)
    setAddMemberError("")
    try {
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${activeTeam._id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({username: newUsername.trim(), role: newRole}),
        },
      )
      const data = await res.json()
      if (res.ok) {
        setMembers(data)
        setShowAddMember(false)
        setNewUsername("")
        setNewRole("Collaborator")
      } else {
        setAddMemberError(data.message ?? "Failed to add member")
      }
    } catch (e) {
      setAddMemberError("Something went wrong")
    }
    setAddMemberLoading(false)
  }

  // PATCH a member's role --> backend handles ownership transfer logic
  const handleRoleChange = async (memberId, role) => {
    setOpenRoleDropdown(null)
    try {
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${activeTeam._id}/members/${memberId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({role}),
        },
      )
      const data = await res.json()
      if (res.ok) setMembers(data)
      else console.warn("Failed to change role:", data.message)
    } catch (e) {
      console.warn("Error changing role", e)
    }
  }

  // Toggle marketplace visibility for all components in the team (WIP)
  const handleVisibilityChange = async (value) => {
    setVisibilityLoading(true)
    setVisibilityOpen(false)
    try {
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${activeTeam._id}/visibility`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({public: value === "Public"}),
        },
      )
      if (res.ok) setVisibility(value)
      else console.warn("Failed to update team visibility")
    } catch (e) {
      console.warn("Error updating team visibility", e)
    }
    setVisibilityLoading(false)
  }

  // Set all components back to private regardless of their current visibility (WIP)
  const handleRevertToPrivate = async () => {
    try {
      await fetch(
        `http://localhost:${PORT}/api/teams/${activeTeam._id}/revert-visibility`,
        {
          method: "POST",
          headers: {Authorization: `Bearer ${token}`},
        },
      )
    } catch (e) {
      console.warn("Error reverting components", e)
    }
  }

  // Permanently delete the team after confirmation — only available to the owner
  const handleDeleteTeam = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return
    try {
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${activeTeam._id}`,
        {
          method: "DELETE",
          headers: {Authorization: `Bearer ${token}`},
        },
      )
      if (res.ok) navigate("/")
      else console.warn("Failed to delete team")
    } catch (e) {
      console.warn("Error deleting team", e)
    }
  }

  const TABS = ["Settings", "Members"]

  // Owners can assign any role, admins can only assign Admin or Collaborator
  // temporarily removed owner from list
  const assignableRoles =
    currentUserRole === "Owner" ? ROLES : ["Admin", "Collaborator"]

  return (
    <div className='min-h-screen flex bg-white'>
      <Sidebar
        activeNav='Team Settings'
        setActiveNav={() => {}}
        activeTeam={activeTeam}
        setActiveTeam={setActiveTeam}
        teams={teams}
        username={username}
        setShowCreateTeam={setShowCreateTeam}
      />

      <main className='flex-1 flex flex-col min-w-0'>
        <Topbar breadcrumbs={["Figma", "Components"]} />

        {/* Tabs */}
        <div className='px-8 border-b border-gray-100'>
          <div className='flex gap-6'>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-gray-900 text-gray-900 font-medium"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}>
                {tab}
                {tab === "Members" && members.length > 0 && (
                  <span className='ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full'>
                    {members.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Tab */}
        {activeTab === "Settings" && (
          <div className='flex-1 px-8 pt-8 pb-10 max-w-3xl'>
            <p className='text-sm text-gray-400 mb-4'>Team</p>
            <div className='flex flex-col gap-3 mb-8'>
              {/* Team Name */}
              <div className='flex flex-col gap-3 px-5 py-4 border border-gray-200 rounded-xl'>
                <p className='text-sm font-medium text-gray-900'>Team Name</p>
                <div className='flex items-center gap-3'>
                  <input
                    type='text'
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRenameTeam()}
                    className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-gray-400'
                  />
                  <button
                    onClick={handleRenameTeam}
                    disabled={
                      teamNameLoading ||
                      !teamName.trim() ||
                      teamName.trim() === activeTeam?.name
                    }
                    className='px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40'>
                    {teamNameLoading ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              {/* Marketplace Visibility */}
              <div className='flex items-center justify-between px-5 py-4 border border-gray-200 rounded-xl'>
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    Marketplace Visibility (WIP)
                  </p>
                  <p className='text-xs text-gray-400 mt-0.5'>
                    All components are hidden from the Marketplace
                  </p>
                </div>
                <div className='relative'>
                  <button
                    onClick={() => setVisibilityOpen((v) => !v)}
                    disabled={visibilityLoading}
                    className='flex items-center gap-3 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50'>
                    {visibilityLoading ? "Saving…" : visibility}
                    <LuChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${visibilityOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {visibilityOpen && (
                    <div className='absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-md z-10 overflow-hidden'>
                      {["Public", "Private"].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleVisibilityChange(opt)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            visibility === opt
                              ? "bg-gray-100 text-gray-900 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Revert to Private */}
              <div className='flex items-center justify-between px-5 py-4 border border-gray-200 rounded-xl'>
                <div>
                  <p className='text-sm font-medium text-gray-900'>
                    Revert Components to Private (WIP)
                  </p>
                  <p className='text-xs text-gray-400 mt-0.5'>
                    All components will revert to being private
                  </p>
                </div>
                <button
                  onClick={handleRevertToPrivate}
                  className='px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors'>
                  Revert Components
                </button>
              </div>
            </div>

            {/* Danger Zone — owners only */}
            {currentUserRole === "Owner" && (
              <>
                <p className='text-sm text-gray-400 mb-4'>Danger Zone</p>
                <div className='flex items-center justify-between px-5 py-4 border border-gray-200 rounded-xl'>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      Delete Team
                    </p>
                    <p className='text-xs text-gray-400 mt-0.5'>
                      Once you do this, you can't go back.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteTeam}
                    className='px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors'>
                    Delete Project
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "Members" && (
          <div className='flex-1 px-8 pt-6 pb-10 max-w-3xl'>
            {/* Search */}
            <div className='mb-6'>
              <SearchBar value={memberSearch} onChange={setMemberSearch} />
            </div>

            {/* Header row */}
            <div className='flex items-center justify-between mb-3'>
              <p className='text-sm text-gray-500'>
                Team Members ({filteredMembers.length})
              </p>
              <button
                onClick={() => {
                  setAddMemberError("")
                  setShowAddMember(true)
                }}
                className='px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors'>
                Add Member
              </button>
            </div>

            {/* Table */}
            <div className='border border-gray-200 rounded-xl'>
              <div className='grid grid-cols-[1fr_1fr_160px] px-4 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-xl'>
                <span className='text-xs font-medium text-gray-500'>Name</span>
                <span className='text-xs font-medium text-gray-500'>
                  Username
                </span>
                <span className='text-xs font-medium text-gray-500'>Role</span>
              </div>

              {filteredMembers.length === 0 ? (
                <div className='px-4 py-8 text-center text-sm text-gray-400'>
                  No members found
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isOwner = member.role === "Owner"
                  const canChange =
                    !isOwner &&
                    (currentUserRole === "Owner" || currentUserRole === "Admin")

                  return (
                    <div
                      key={member._id}
                      className='grid grid-cols-[1fr_1fr_160px] px-4 py-3 border-b border-gray-100 last:border-0 last:rounded-b-xl items-center'>
                      {/* Name */}
                      <div className='flex items-center gap-3'>
                        <div className='w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0'>
                          {member.username?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className='text-sm text-gray-800'>
                          {member.fName && member.lName
                            ? `${member.fName} ${member.lName}`
                            : member.username}
                        </span>
                      </div>

                      {/* Username */}
                      <span className='text-sm text-gray-500'>
                        {member.username}
                      </span>

                      {/* Role */}
                      <div className='relative'>
                        {canChange ? (
                          <>
                            <button
                              onClick={() =>
                                setOpenRoleDropdown((prev) =>
                                  prev === member._id ? null : member._id,
                                )
                              }
                              className='flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50 w-fit'>
                              {member.role}
                              <LuChevronDown className='w-3.5 h-3.5 text-gray-400' />
                            </button>
                            {openRoleDropdown === member._id && (
                              <div className='absolute left-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-md z-10 overflow-hidden'>
                                {assignableRoles.map((r) => (
                                  <button
                                    key={r}
                                    onClick={() =>
                                      handleRoleChange(member._id, r)
                                    }
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                      member.role === r
                                        ? "bg-gray-100 text-gray-900 font-medium"
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`}>
                                    {r}
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className='flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-400 w-fit cursor-default select-none'>
                            {member.role}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </main>

      {showCreateTeam && (
        <CreateTeamModal
          onClose={() => setShowCreateTeam(false)}
          onSubmit={handleCreateTeam}
        />
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div
          className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'
          onClick={(e) =>
            e.target === e.currentTarget && setShowAddMember(false)
          }>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4'>
            <h2 className='text-base font-semibold text-gray-900'>
              Add Member
            </h2>

            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-medium text-gray-500'>
                Username
              </label>
              <input
                type='text'
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                placeholder='Enter username…'
                autoFocus
                className='px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-gray-400'
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-medium text-gray-500'>Role</label>
              <div className='relative'>
                <button
                  onClick={() => setNewRoleOpen((v) => !v)}
                  className='w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors'>
                  {newRole}
                  <LuChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${newRoleOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {newRoleOpen && (
                  <div className='absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 overflow-hidden'>
                    {["Admin", "Collaborator"].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setNewRole(r)
                          setNewRoleOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          newRole === r
                            ? "bg-gray-100 text-gray-900 font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {addMemberError && (
              <p className='text-xs text-red-500'>{addMemberError}</p>
            )}

            <div className='flex gap-2 pt-1'>
              <button
                onClick={() => setShowAddMember(false)}
                className='flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors'>
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={addMemberLoading || !newUsername.trim()}
                className='flex-1 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40'>
                {addMemberLoading ? "Adding…" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
