import {useContext, useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "../context/AuthContext"
import {DataContext} from "../context/DataContext"
import Sidebar from "../components/Sidebar"
import PageTitle from "../components/PageTitle"
import Button from "../components/Button"
import TextInput from "../components/TextInput"
import Table from "../components/Table"

export default function UserProfile() {
  const {user, logout} = useContext(AuthContext)
  const {teams, activeTeam, setActiveTeam, userProfile, updateProfile} = useContext(DataContext)
  const username = user?.username || ""
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("Profile")
  const [newUsername, setNewUsername] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(false)
  }, [newUsername])

  const getRoleForTeam = (team) => {
    if (!user?.id) return "Member"
    if (team.owner === user.id || team.owner?._id === user.id) return "Owner"
    if (team.admins?.some((a) => a === user.id || a?._id === user.id))
      return "Admin"
    return "Collaborator"
  }

  const handleSave = async () => {
    setSaving(true)
    await updateProfile({username: newUsername})
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className='min-h-screen flex bg-white'>
      <Sidebar activeTeam={activeTeam} setActiveTeam={setActiveTeam} teams={teams} username={username} />
      <main className='flex-1 flex flex-col min-w-0'>
      {/* Page title */}
      <div className='page-gutter-x pt-6'>
        <PageTitle breadcrumbs={["Profile"]} />
      </div>

      {/* Tabs */}
      <div className='page-gutter-x border-b border-gray-100'>
        <div className='flex gap-6'>
          {["Profile", "Teams"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-gray-900 text-gray-900 font-medium"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}>
              {tab}
              {tab === "Teams" && teams.length > 0 && (
                <span className='ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full'>
                  {teams.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === "Profile" && (
        <div className='flex-1 page-gutter-x page-gutter-y flex flex-col w-full'>
          <p className='text-sm text-gray-400 mb-4'>Account</p>
          <div className='flex flex-col gap-3 mb-8'>
            <div className='flex flex-col gap-2'>
              <p className='text-sm font-medium text-gray-900'>Username</p>
              <TextInput
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={userProfile?.username ?? username}
              />
            </div>
          </div>

          <div className='flex gap-2 mb-8'>
            <Button
              body={saving ? "Saving…" : saved ? "Saved" : "Save"}
              size='sm'
              style='primary'
              onClick={handleSave}
            />
            <Button
              body="Sign Out"
              size='sm'
              style='secondary'
              onClick={() => { logout(); navigate("/login") }}
            />
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === "Teams" && (
        <div className='flex-1 page-gutter-x page-gutter-y'>
          <p className='text-sm text-gray-400 mb-4'>Teams</p>
          <div className='flex flex-col gap-3 mb-8'>
            <Table
              colWidths="1fr 160px"
              columns={[
                {
                  label: "Team",
                  key: "name",
                  render: (row) => <p className='text-sm text-gray-800'>{row.name}</p>,
                },
                {
                  label: "Role",
                  key: "role",
                  render: (row) => (
                    <p className='px-3 py-1.5 border border-gray-200 rounded-full text-sm text-gray-400 bg-gray-50 w-fit'>
                      {getRoleForTeam(row)}
                    </p>
                  ),
                },
              ]}
              rows={teams}
              emptyMessage="No teams found"
            />
          </div>
        </div>
      )}
      </main>
    </div>
  )
}
