import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";

import Topbar from "../components/Topbar";
import Button from "../components/Button";
import TeamCard from "../components/TeamCard";
import TeamCardInput from "../components/TeamCardInput";
import { extractTeamId } from "../utils/extractTeamId";
import Status from "../components/Status";

export default function Teams() {
  const { logout, user } = useContext(AuthContext);
  const { teams, setActiveTeam, createTeam } = useContext(DataContext);
  const navigate = useNavigate();

  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamUrl, setNewTeamUrl] = useState("");
  const [createError, setCreateError] = useState("");
  const [cardColor, setCardColor] = useState("#d9272b");

  const COLORS = [
    { label: "Red", hex: "#d9272b" },
    { label: "Blue", hex: "#1a56db" },
    { label: "Black", hex: "#111111" },
    { label: "Green", hex: "#057a55" },
  ];

  const username = user?.username || "";

  const handleCreateTeam = async ({ name, url }) => {
    const externalId = extractTeamId(url);
    return await createTeam({ name, externalId });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSelectTeam = (team) => {
    setActiveTeam(team);
    navigate(`/team/${team._id}`);
  };

  const handleCancel = () => {
    setShowCreateTeam(false);
    setNewTeamName("");
    setNewTeamUrl("");
    setCreateError("");
  };

  return (
    <div className="relative min-h-screen flex bg-white">

      <main className="relative flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar logo={<h3>IAT459</h3>}>
          <Button body="Logout" onClick={handleLogout} size="sm" style="secondary" />
        </Topbar>

        <div className="flex-1 px-8 pt-6 pb-8 flex flex-col items-start">
          <div className="mb-[2rem]">
            <h3>Your Teams</h3>
          </div>

          <div className="flex flex-row flex-wrap gap-4 items-center">
            {teams.map((team) => (
              <TeamCard
                key={team._id}
                name={team.name}
                description={team.description}
                owner={team.owner?.username}
                date={team.createdAt}
                onClick={() => handleSelectTeam(team)}
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
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl hover:opacity-80"
              >
                +
              </button>
            )}
          </div>
        </div>

        {showCreateTeam && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20">
            <div className="flex items-center gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.label}
                  onClick={() => setCardColor(c.hex)}
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{
                    backgroundColor: c.hex,
                    boxShadow: cardColor === c.hex ? "0 0 0 2px white, 0 0 0 3px black" : "none",
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
            <Button
              body="Create"
              size="lg"
              style="primary"
              onClick={async () => {
                if (!newTeamName.trim()) return setCreateError("Name required.");
                if (!newTeamUrl.trim()) return setCreateError("URL required.");
                const err = await handleCreateTeam({ name: newTeamName, url: newTeamUrl });
                if (err) {
                  setCreateError(err);
                } else {
                  setShowCreateTeam(false);
                  setNewTeamName("");
                  setNewTeamUrl("");
                  setCreateError("");
                }
              }}
            />
            <Button body="Cancel" size="lg" style="secondary" onClick={handleCancel} />
            </div>
          </div>
        )}
      </main>

      <Status body={createError} type="error" onClose={() => setCreateError("")} />
    </div>
  );
}
