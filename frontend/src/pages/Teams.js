import {useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AnimatePresence} from "framer-motion"
import {AuthContext} from "../context/AuthContext"
import {DataContext} from "../context/DataContext"

import Sidebar from "../components/Sidebar"
import PageTitle from "../components/PageTitle"
import Button from "../components/Button"
import TeamCard from "../components/TeamCard"
import TeamCardInput from "../components/TeamCardInput"
import {extractTeamId} from "../utils/extractTeamId"
import {toSlug} from "../utils/toSlug"
import Status from "../components/Status"

export default function Teams() {
  const {user} = useContext(AuthContext)
  const {teams, activeTeam, setActiveTeam, fetchComponents, createTeam} =
    useContext(DataContext)
  const navigate = useNavigate()

  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [loadingTeamId, setLoadingTeamId] = useState(null)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamUrl, setNewTeamUrl] = useState("")
  const [createError, setCreateError] = useState("")
  const [cardColor, setCardColor] = useState("#d9272b")

  const COLORS = [
    {label: "Red", hex: "#dc2626"},    // red-600
    {label: "Blue", hex: "#2563eb"},   // blue-600
    {label: "Black", hex: "#111827"},  // gray-900
    {label: "Green", hex: "#047857"},  // emerald-700
  ]

  const username = user?.username || ""

  const handleCreateTeam = async ({name, url}) => {
    const externalId = extractTeamId(url)
    return await createTeam({name, externalId})
  }

  const handleSelectTeam = async (team) => {
    setLoadingTeamId(team._id)
    setActiveTeam(team)
    await fetchComponents(team._id) // wait for components to render before navigating
    navigate(`/team/${toSlug(team.name)}`)
  }

  const handleCancel = () => {
    setShowCreateTeam(false)
    setNewTeamName("")
    setNewTeamUrl("")
    setCreateError("")
  }

  return (
    <div className='relative min-h-screen flex bg-white'>
      <Sidebar activeTeam={null} setActiveTeam={setActiveTeam} teams={teams} username={username} />
      <main className='relative flex-1 flex flex-col min-w-0 overflow-hidden'>
        <div className='flex-1 page-gutter-x page-gutter-y flex flex-col items-start'>
          <PageTitle breadcrumbs={["Teams"]} />

          <div className='flex flex-row flex-wrap gap-4 items-center'>
            {teams.map((team) => (
              <TeamCard
                key={team._id}
                name={loadingTeamId === team._id ? "Loading..." : team.name}
                description={team.description}
                owner={team.owner?.username}
                date={team.createdAt}
                onClick={() => (loadingTeamId ? null : handleSelectTeam(team))}
              />
            ))}

            <AnimatePresence>
              {showCreateTeam && (
                <TeamCardInput
                  username={username}
                  color={cardColor}
                  name={newTeamName}
                  setName={setNewTeamName}
                  url={newTeamUrl}
                  setUrl={setNewTeamUrl}
                />
              )}
            </AnimatePresence>

            {!showCreateTeam && (
              <button
                onClick={() => setShowCreateTeam(true)}
                className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl hover:opacity-80'>
                +
              </button>
            )}
          </div>
        </div>

        {showCreateTeam && (
          <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20'>
            <div className='flex items-center gap-1.5'>
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  type='button'
                  title={c.label}
                  onClick={() => setCardColor(c.hex)}
                  className='w-4 h-4 rounded-full shrink-0'
                  style={{
                    backgroundColor: c.hex,
                    boxShadow:
                      cardColor === c.hex
                        ? "0 0 0 2px white, 0 0 0 3px black"
                        : "none",
                  }}
                />
              ))}
            </div>
            <div className='flex gap-2'>
              <Button
                body='Create'
                size='lg'
                style='primary'
                onClick={async () => {
                  if (!newTeamName.trim())
                    return setCreateError("Name required.")
                  if (!newTeamUrl.trim()) return setCreateError("URL required.")
                  const err = await handleCreateTeam({
                    name: newTeamName,
                    url: newTeamUrl,
                  })
                  if (err) {
                    setCreateError(err)
                  } else {
                    setShowCreateTeam(false)
                    setNewTeamName("")
                    setNewTeamUrl("")
                    setCreateError("")
                  }
                }}
              />
              <Button
                body='Cancel'
                size='lg'
                style='secondary'
                onClick={handleCancel}
              />
            </div>
          </div>
        )}
      </main>

      <Status
        body={createError}
        type='error'
        onClose={() => setCreateError("")}
      />
    </div>
  )
}
