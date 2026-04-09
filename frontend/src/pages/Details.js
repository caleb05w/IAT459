import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import Dropdown from "../components/Dropdown";
import PageTitle from "../components/PageTitle";
import Table from "../components/Table";
import Status from "../components/Status";

const PORT = 5001;

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Details() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { teams, activeTeam, setActiveTeam } = useContext(DataContext)

  const { component } = state || {};
  const username = useContext(AuthContext).user?.username || "";

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPublic, setIsPublic] = useState(component?.public ?? false);
  const [visibilityLoading, setVisibilityLoading] = useState(false);
  const [visibilityStatus, setVisibilityStatus] = useState(null); // null | "success" | "error"
  const [hasUpdate, setHasUpdate] = useState(component?.hasUpdate ?? false);
  const [liveComponent, setLiveComponent] = useState(component);

  // True if the current user belongs to the component's team, regardless of how they got here.
  const isMember = teams.some((t) => t._id === liveComponent?.team);
  const [acceptLoading, setAcceptLoading] = useState(false);

  const handleVisibilityChange = async (value) => {
    setVisibilityLoading(true);
    try {
      const teamId = activeTeam?._id ?? component.team;
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${teamId}/components/${component._id}/visibility`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ public: value }),
        },
      );
      if (res.ok) {
        setIsPublic(value);
        setVisibilityStatus("success");
      } else {
        setVisibilityStatus("error");
      }
    } catch (e) {
      setVisibilityStatus("error");
    }
    setVisibilityLoading(false);
  };

  const handleAccept = async () => {
    setAcceptLoading(true);
    try {
      const teamId = activeTeam?._id ?? liveComponent.team;
      const res = await fetch(
        `http://localhost:${PORT}/api/teams/${teamId}/components/${liveComponent._id}/accept`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const updated = await res.json();
        setLiveComponent(updated);
        setHasUpdate(false);
      } else {
        console.warn("Failed to accept update");
      }
    } catch (e) {
      console.warn("Error accepting update", e);
    }
    setAcceptLoading(false);
  };

  if (!component) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar
        activeTeam={activeTeam}
        setActiveTeam={setActiveTeam}
        teams={teams}
        username={username}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 page-gutter-x page-gutter-y flex flex-col gap-6">
          <PageTitle
            breadcrumbs={isMember ? [activeTeam?.name, "Components", liveComponent.name] : [liveComponent.name]}
            onBreadcrumbClick={(i) => {
              if (i === 0 || i === 1) navigate(`/team/${activeTeam._id}`);
            }}
          />

          {/* Preview — side by side if hasUpdate, single if not */}
          {hasUpdate ? (
            <div className="flex gap-0 w-full border border-gray-200 rounded-2xl overflow-hidden">
              {/* Current */}
              <div className="flex-1 flex flex-col gap-3 p-5">
                <p className="px-2 py-0.5 rounded text-xs font-medium border border-gray-300 text-gray-600 w-fit">
                  Current Version
                </p>
                <div
                  className="w-full rounded-xl bg-[#F6F6F6] overflow-hidden flex items-center justify-center"
                  style={{ minHeight: "260px" }}
                >
                  {liveComponent.curr_thumbnail ? (
                    <img
                      src={liveComponent.curr_thumbnail}
                      alt="Current"
                      className="max-w-full max-h-[360px] object-contain"
                    />
                  ) : (
                    <p className="text-gray-300 text-sm">
                      No preview available
                    </p>
                  )}
                </div>
                <div>
                  <h6 className="font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Description
                  </h6>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {liveComponent.curr_description ||
                      "No description provided."}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px bg-gray-200 self-stretch" />

              {/* Incoming */}
              <div className="flex-1 flex flex-col gap-3 p-5">
                <p className="px-2 py-0.5 rounded text-xs font-medium bg-black text-white w-fit">
                  Incoming Version
                </p>
                <div
                  className="w-full rounded-xl bg-[#F6F6F6] overflow-hidden flex items-center justify-center"
                  style={{ minHeight: "260px" }}
                >
                  {liveComponent.inc_thumbnail ? (
                    <img
                      src={liveComponent.inc_thumbnail}
                      alt="Incoming"
                      className="max-w-full max-h-[360px] object-contain"
                    />
                  ) : (
                    <p className="text-gray-300 text-sm">
                      No preview available
                    </p>
                  )}
                </div>
                <div>
                  <h6 className="font-medium text-gray-400 uppercase tracking-wide mb-1">
                    Description
                  </h6>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {liveComponent.inc_description ||
                      "No description provided."}
                  </p>
                </div>
                <Button
                  body={acceptLoading ? "Accepting…" : "Accept Update"}
                  onClick={handleAccept}
                  size="sm"
                  style="primary"
                />
              </div>
            </div>
          ) : (
            <div
              className="w-full rounded-2xl bg-[#F6F6F6] border border-gray-200 overflow-hidden flex items-center justify-center"
              style={{ minHeight: "360px" }}
            >
              {liveComponent.curr_thumbnail ? (
                <img
                  src={liveComponent.curr_thumbnail}
                  alt={liveComponent.name}
                  className="max-w-full max-h-[480px] object-contain"
                />
              ) : (
                <p className="text-gray-300 text-sm">No preview available</p>
              )}
            </div>
          )}

          {/* Info — always visible */}
          <div className="flex flex-col gap-5 w-full">
            <div className="grid grid-cols-2 gap-x-8 gap-y-8">
              <div>
                <h6 className="uppercase tracking-wide text-gray-400 mb-2">
                  Component Name
                </h6>
                <p className="text-gray-900">{liveComponent.name}</p>
              </div>

              {!hasUpdate && (
                <div>
                  <h6 className="uppercase tracking-wide text-gray-400 mb-2">
                    Description
                  </h6>
                  <p className="text-gray-600">
                    {liveComponent.curr_description ||
                      "No description provided."}
                  </p>
                </div>
              )}

              <div>
                <h6 className="uppercase tracking-wide text-gray-400 mb-2">
                  Last Updated
                </h6>
                <p className="text-gray-600">
                  {formatDateTime(liveComponent.curr_last_updated)}
                </p>
              </div>

              {isMember && <div>
                <h6 className="uppercase tracking-wide text-gray-400 mb-2">
                  Visibility
                </h6>
                <Dropdown
                  value={
                    visibilityLoading
                      ? "Saving…"
                      : isPublic
                        ? "Public"
                        : "Private"
                  }
                  options={["Public", "Private"]}
                  onChange={(label) =>
                    handleVisibilityChange(label === "Public")
                  }
                />
              </div>}
            </div>

            {isMember && <Button
              body={showAdvanced ? "Hide Advanced Details" : "Advanced Details"}
              onClick={() => setShowAdvanced((v) => !v)}
              size="sm"
              style="secondary"
            />}

            {showAdvanced && (
              <Table
                size="small"
                colWidths="160px 1fr"
                columns={[
                  {
                    label: "Key",
                    key: "key",
                    render: (row) => (
                      <h6 className="text-gray-400 font-mono">{row.key}</h6>
                    ),
                  },
                  {
                    label: "Value",
                    key: "value",
                    render: (row) => (
                      <h6 className="text-gray-700 font-mono break-all">
                        {row.value === null || row.value === undefined ? (
                          <span className="text-gray-300">null</span>
                        ) : (
                          String(row.value)
                        )}
                      </h6>
                    ),
                  },
                ]}
                rows={Object.entries(liveComponent).map(([key, value]) => ({
                  _id: key,
                  key,
                  value,
                }))}
              />
            )}
          </div>
        </div>
      </main>
      <Status
        body={visibilityStatus === "success" ? "Visibility updated" : visibilityStatus === "error" ? "Failed to update visibility" : ""}
        type={visibilityStatus === "success" ? "confirm" : "error"}
        onClose={() => setVisibilityStatus(null)}
      />
    </div>
  );
}
