import {useContext, useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "../context/AuthContext"
import {DataContext} from "../context/DataContext"
import Sidebar from "../components/Sidebar"
import SearchBar from "../components/SearchBar"
import Button from "../components/Button"
import TextInput from "../components/TextInput"
import Dropdown from "../components/Dropdown"
import SettingsRow from "../components/SettingsRow"
import PageTitle from "../components/PageTitle"
import {extractTeamId} from "../utils/extractTeamId"
import {toSlug} from "../utils/toSlug"

const PORT = 5001
const ROLES = ["Admin", "Collaborator"]

export default function TeamSettings() {
  const {token} = useContext(AuthContext)
  const {
    teams,
    activeTeam,
    setActiveTeam,
    renameTeam,
    createTeam,
    deleteTeam,
    currentUserRole,
  } = useContext(DataContext)
  const username = useContext(AuthContext).user?.username || ""
  const navigate = useNavigate()

  const handleCreateTeam = async ({name, url}) => {
    const externalId = extractTeamId(url)
    await createTeam({name, externalId})
  }

  const [activeTab, setActiveTab] = useState("Settings")
  const [teamName, setTeamName] = useState("")
  const [teamNameLoading, setTeamNameLoading] = useState(false)
  const [visibility, setVisibility] = useState("Private")
  const [visibilityLoading, setVisibilityLoading] = useState(false)

  useEffect(() => {
    setTeamName(activeTeam?.name ?? "")
  }, [activeTeam?._id])

  const handleRenameTeam = async () => {
    if (!teamName.trim() || teamName.trim() === activeTeam?.name) return
    setTeamNameLoading(true)
    await renameTeam(activeTeam._id, teamName.trim())
    setTeamNameLoading(false)
  }

  const [members, setMembers] = useState([])
  const [memberSearch, setMemberSearch] = useState("")

  const [showAddMember, setShowAddMember] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newRole, setNewRole] = useState("Collaborator")
  const [addMemberLoading, setAddMemberLoading] = useState(false)
  const [addMemberError, setAddMemberError] = useState("")

  useEffect(() => {
    if (!activeTeam || activeTab !== "Members") return
    fetch(`http://localhost:${PORT}/api/teams/${activeTeam._id}/members`, {
      headers: {Authorization: `Bearer ${token}`},
    })
      .then((r) => r.json())
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch((e) => console.warn("Error fetching members", e))
  }, [activeTeam, activeTab, token])

  const filteredMembers = members.filter((m) => {
    const q = memberSearch.toLowerCase()
    return (
      m.username?.toLowerCase().includes(q) ||
      m.fName?.toLowerCase().includes(q) ||
      m.lName?.toLowerCase().includes(q)
    )
  })

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

  const handleRoleChange = async (memberId, role) => {
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

  const handleVisibilityChange = async (value) => {
    setVisibilityLoading(true)
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

  const handleDeleteTeam = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return
    const ok = await deleteTeam(activeTeam._id)
    if (ok) navigate("/")
  }

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return
    try {
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${activeTeam._id}/leave`,
        {
          method: "POST",
          headers: {Authorization: `Bearer ${token}`},
        },
      )
      if (res.ok) navigate("/teams")
      else {
        const data = await res.json()
        console.warn("Failed to leave team:", data.message)
      }
    } catch (e) {
      console.warn("Error leaving team", e)
    }
  }

  const isCollaborator = currentUserRole === "Collaborator"
  const TABS = isCollaborator ? ["Settings"] : ["Settings", "Members"]
  const assignableRoles = currentUserRole === "Owner" ? ROLES : ["Admin", "Collaborator"]

  return (
    <div className='min-h-screen flex bg-white'>
      <Sidebar
        activeTeam={activeTeam}
        setActiveTeam={setActiveTeam}
        teams={teams}
        username={username}
      />

      <main className='flex-1 flex flex-col min-w-0'>
        {/* Page title */}
        <div className='page-gutter-x pt-6'>
          <PageTitle
            breadcrumbs={[activeTeam?.name, "Settings"]}
            onBreadcrumbClick={(i) => { if (i === 0) navigate(`/team/${toSlug(activeTeam.name)}`) }}
          />
        </div>

        {/* Tabs */}
        <div className='page-gutter-x border-b border-gray-100'>
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
          <div className='flex-1 page-gutter-x page-gutter-y w-full flex flex-col'>
            {!isCollaborator && (
              <>
                <p className='text-sm text-gray-400 mb-4'>Team</p>
                <div className='flex flex-col gap-3 mb-8'>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-900">Team Name</p>
                    <TextInput
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Team name…"
                    />
                  </div>

                  <SettingsRow
                    title="Marketplace Visibility (WIP)"
                    description="All components are hidden from the Marketplace">
                    <Dropdown
                      value={visibilityLoading ? "Saving…" : visibility}
                      options={["Public", "Private"]}
                      onChange={handleVisibilityChange}
                    />
                  </SettingsRow>

                  <SettingsRow
                    title="Revert Components to Private (WIP)"
                    description="All components will revert to being private"
                    buttonLabel="Revert Components"
                    buttonStyle="danger"
                    onAction={handleRevertToPrivate}
                  />
                </div>
              </>
            )}

            <p className='text-sm text-gray-400 mb-4'>Danger Zone</p>
            <div className='flex flex-col gap-3 mb-8'>
              <SettingsRow
                title="Leave Team"
                description="You will lose access to this team and its components."
                buttonLabel="Leave Team"
                buttonStyle="danger"
                onAction={handleLeaveTeam}
              />
              {currentUserRole === "Owner" && (
                <SettingsRow
                  title="Delete Team"
                  description="Once you do this, you can't go back."
                  buttonLabel="Delete Team"
                  buttonStyle="danger"
                  onAction={handleDeleteTeam}
                />
              )}
            </div>

            {!isCollaborator && (
              <div className='mt-auto pt-4'>
                <Button
                  body={teamNameLoading ? "Saving…" : "Save"}
                  size="sm"
                  style="primary"
                  onClick={handleRenameTeam}
                />
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "Members" && (
          <div className='flex-1 page-gutter-x page-gutter-y w-full'>
            <p className='text-sm text-gray-400 mb-4'>Members</p>
            <div className='flex flex-col gap-3 mb-6'>
              <SearchBar value={memberSearch} onChange={setMemberSearch} />
            </div>

            <div className='flex items-center justify-between mb-3'>
              <p className='text-sm text-gray-500'>
                Team Members ({filteredMembers.length})
              </p>
              <Button
                body="Add Member"
                size="sm"
                style="secondary"
                onClick={() => {
                  setAddMemberError("")
                  setShowAddMember(true)
                }}
              />
            </div>

            <div className='border border-gray-200 rounded-xl'>
              <div className='grid grid-cols-[1fr_1fr_160px] px-4 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-xl'>
                <h6 className='font-medium text-gray-500'>Name</h6>
                <h6 className='font-medium text-gray-500'>Username</h6>
                <h6 className='font-medium text-gray-500'>Role</h6>
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

                      <span className='text-sm text-gray-500'>{member.username}</span>

                      <div>
                        {canChange ? (
                          <Dropdown
                            value={member.role}
                            options={assignableRoles}
                            onChange={(r) => handleRoleChange(member._id, r)}
                          />
                        ) : (
                          <p className='px-3 py-1.5 border border-gray-200 rounded-full text-sm text-gray-400 bg-gray-50'>
                            {member.role}
                          </p>
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

      {/* Add Member Modal */}
      {showAddMember && (
        <div
          className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'
          onClick={(e) => e.target === e.currentTarget && setShowAddMember(false)}>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4'>
            <h2 className='text-base font-semibold text-gray-900'>Add Member</h2>

            <TextInput
              body="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter username…"
            />

            <div className='flex flex-col gap-1.5'>
              <h6 className='font-medium text-gray-500'>Role</h6>
              <Dropdown
                value={newRole}
                options={["Admin", "Collaborator"]}
                onChange={setNewRole}
              />
            </div>

            {addMemberError && (
              <p className='text-xs text-red-500'>{addMemberError}</p>
            )}

            <div className='flex gap-2 pt-1'>
              <Button
                body="Cancel"
                size="sm"
                style="secondary"
                onClick={() => setShowAddMember(false)}
              />
              <Button
                body={addMemberLoading ? "Adding…" : "Add"}
                size="sm"
                style="primary"
                onClick={handleAddMember}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
