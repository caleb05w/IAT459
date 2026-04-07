import {useContext, useEffect, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "../context/AuthContext"
import {DataContext} from "../context/DataContext"
import Button from "../components/Button"
import TextInput from "../components/TextInput"
import Topbar from "../components/Topbar"

export default function UserProfile() {
  const {user, logout} = useContext(AuthContext)
  const {teams, userProfile, updateProfile} = useContext(DataContext)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("Profile")
  const [fName, setFName] = useState("")
  const [lName, setLName] = useState("")
  const [figmaToken, setFigmaToken] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!userProfile) return
    setFName(userProfile.fName ?? "")
    setLName(userProfile.lName ?? "")
    setFigmaToken(userProfile.figmaToken ?? "")
  }, [userProfile])

  useEffect(() => {
    setSaved(false)
  }, [fName, lName, figmaToken])

  const getRoleForTeam = (team) => {
    if (!user?.id) return "Member"
    if (team.owner === user.id || team.owner?._id === user.id) return "Owner"
    if (team.admins?.some((a) => a === user.id || a?._id === user.id))
      return "Admin"
    return "Collaborator"
  }

  const handleSave = async () => {
    setSaving(true)
    await updateProfile({fName, lName, figmaToken})
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      {/* Top bar */}
      <Topbar breadcrumbs={["Profile"]}>
        <Button
          body='Back'
          size='sm'
          style='secondary'
          onClick={() => navigate(-1)}
        />
        <Button
          body='Logout'
          size='sm'
          style='secondary'
          onClick={() => {
            logout()
            navigate("/login")
          }}
        />
      </Topbar>

      {/* Tabs */}
      <div className='px-8 border-b border-gray-100'>
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
        <div className='flex-1 px-8 pt-8 pb-10 flex flex-col max-w-2xl'>
          <p className='text-sm text-gray-400 mb-4'>Account</p>
          <div className='flex flex-col gap-3 mb-8'>
            <div className='flex gap-3'>
              <div className='flex flex-col gap-2 flex-1'>
                <p className='text-sm font-medium text-gray-900'>First Name</p>
                <TextInput
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  placeholder='First name…'
                />
              </div>
              <div className='flex flex-col gap-2 flex-1'>
                <p className='text-sm font-medium text-gray-900'>Last Name</p>
                <TextInput
                  value={lName}
                  onChange={(e) => setLName(e.target.value)}
                  placeholder='Last name…'
                />
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <p className='text-sm font-medium text-gray-900'>Username</p>
              <p className='text-sm text-gray-600'>
                {userProfile?.username ?? user?.username ?? "..."}
              </p>
            </div>
          </div>

          {/* <p className='text-sm text-gray-400 mb-4'>Figma</p>
          <div className='flex flex-col gap-3 mb-8'>
            <div className='flex flex-col gap-2'>
              <p className='text-sm font-medium text-gray-900'>
                Personal Access Token
              </p>
              <TextInput
                value={figmaToken}
                onChange={(e) => setFigmaToken(e.target.value)}
                placeholder='figd_…'
                type='password'
              />
            </div>
          </div> */}

          <div className='mt-auto pt-4'>
            <Button
              body={saving ? "Saving…" : saved ? "Saved" : "Save"}
              size='sm'
              style='primary'
              onClick={handleSave}
            />
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === "Teams" && (
        <div className='flex-1 px-8 pt-6 pb-10 max-w-2xl'>
          <p className='text-sm text-gray-500 mb-3'>Teams ({teams.length})</p>
          <div className='border border-gray-200 rounded-xl'>
            <div className='grid grid-cols-[1fr_160px] px-4 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-xl'>
              <span className='text-xs font-medium text-gray-500'>Team</span>
              <span className='text-xs font-medium text-gray-500'>Role</span>
            </div>
            {teams.length === 0 ? (
              <div className='px-4 py-8 text-center text-sm text-gray-400'>
                No teams found
              </div>
            ) : (
              teams.map((team) => (
                <div
                  key={team._id}
                  className='grid grid-cols-[1fr_160px] px-4 py-3 border-b border-gray-100 last:border-0 last:rounded-b-xl items-center'>
                  <span className='text-sm text-gray-800'>{team.name}</span>
                  <span className='px-3 py-1.5 border border-gray-200 rounded-full text-sm text-gray-400 bg-gray-50 w-fit'>
                    {getRoleForTeam(team)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
