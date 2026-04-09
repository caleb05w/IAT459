import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import { LuLayoutGrid, LuList } from "react-icons/lu";
import Sidebar from "../components/Sidebar";
import PageTitle from "../components/PageTitle";
import SearchBar from "../components/SearchBar";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import DashboardCard from "../components/DashboardCard";
import DashboardList from "../components/DashboardList";

const PORT = 5001;

export default function Marketplace() {
  const { token, user } = useContext(AuthContext);
  // activeTeam needed so sidebar can navigate to the correct team routes when logged in
  const { teams, activeTeam, setActiveTeam } = useContext(DataContext);
  const navigate = useNavigate();
  const username = user?.username || "";

  const [components, setComponents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("viewMode") || "grid",
  );
  const [sortBy, setSortBy] = useState("Latest");

  const updateViewMode = (mode) => {
    localStorage.setItem("viewMode", mode);
    setViewMode(mode);
  };

  // Fetch all public components — no auth required
  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const res = await fetch(
          `http://localhost:${PORT}/api/teams/components/public`,
        );
        const data = await res.json();
        if (res.ok) {
          setComponents(data);
        } else console.warn("Failed to fetch public components:", data.message);
      } catch (e) {
        console.warn("Error fetching public components", e);
      }
    };

    fetchPublic();
  }, [token]);

  // Re-filter and re-sort whenever search query, sort order, or component list changes
  useEffect(() => {
    let result = [...components];
    if (sortBy === "Latest") {
      result.sort((a, b) => new Date(b.curr_last_updated) - new Date(a.curr_last_updated));
    } else if (sortBy === "Oldest") {
      result.sort((a, b) => new Date(a.curr_last_updated) - new Date(b.curr_last_updated));
    } else if (sortBy === "A-Z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) result = result.filter((c) => c.name.toLowerCase().includes(q));
    setFilteredComponents(result);
  }, [searchQuery, components, sortBy]);

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar activeTeam={activeTeam} setActiveTeam={setActiveTeam} teams={teams} username={username} />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex flex-col page-gutter-x page-gutter-y">
          <PageTitle breadcrumbs={["Marketplace"]} />
          <div className="flex items-center gap-3 mb-6 justify-between w-full">
          <div className="flex flex-row gap-[0.5rem] flex-1">
            <Dropdown
              value={sortBy}
              options={["Latest", "Oldest", "A-Z"]}
              onChange={setSortBy}
            />
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
          <div className="flex flex-row gap-[0.5rem]">
            <Button
              body={
                <span className="flex items-center gap-1.5">
                  <LuLayoutGrid className="w-3.5 h-3.5" />
                  Grid
                </span>
              }
              size="sm"
              style={viewMode === "grid" ? "tertiary" : "none"}
              onClick={() => updateViewMode("grid")}
            />
            <Button
              body={
                <span className="flex items-center gap-1.5">
                  <LuList className="w-3.5 h-3.5" />
                  List
                </span>
              }
              size="sm"
              style={viewMode === "list" ? "tertiary" : "none"}
              onClick={() => updateViewMode("list")}
            />
          </div>
        </div>

        {filteredComponents.length === 0 ? (
          <p className="flex items-center justify-center h-48 text-gray-400 text-sm">
            No public components yet
          </p>
        ) : viewMode === "grid" ? (
          <div className="flex flex-wrap gap-4">
            {filteredComponents.map((component, i) => (
              <DashboardCard
                key={i}
                header={component.name}
                body={component.curr_description}
                thumbnail={component.curr_thumbnail}
                last_updated={component.curr_last_updated}
                onClick={() =>
                  navigate("/details", {
                    state: { component, activeTeam: null },
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-[180px_1fr_220px] border-b border-gray-200 pb-2 mb-1">
              <h6 className="font-medium text-gray-500 uppercase tracking-wide">Image</h6>
              <h6 className="font-medium text-gray-500 uppercase tracking-wide">Title</h6>
              <h6 className="font-medium text-gray-500 uppercase tracking-wide">Last Edited</h6>
            </div>
            {filteredComponents.map((component, i) => (
              <DashboardList
                key={i}
                name={component.name}
                thumbnail={component.curr_thumbnail}
                user={component.last_user}
                last_updated={component.curr_last_updated}
                link={""}
                onClick={() =>
                  navigate("/details", {
                    state: { component, activeTeam: null },
                  })
                }
              />
            ))}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
