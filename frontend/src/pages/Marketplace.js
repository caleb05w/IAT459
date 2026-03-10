import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PublicSidebar from "../components/PublicSidebar";
import SearchBar from "../components/SearchBar";
import DashboardCard from "../components/DashboardCard";

const PORT = 5001;

export default function Marketplace() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [components, setComponents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredComponents, setFilteredComponents] = useState([]);

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const res = await fetch(
          `http://localhost:${PORT}/api/teams/components/public`,
        );
        const data = await res.json();
        if (res.ok) {
          console.log("Successfully grabbed components:", res.status);
          setComponents(data);
        } else console.warn("Failed to fetch public components:", data.message);
      } catch (e) {
        console.warn("Error fetching public components", e);
      }
    };

    fetchPublic();
  }, [token]);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return setFilteredComponents(components);
    setFilteredComponents(
      components.filter((c) => c.name.toLowerCase().includes(q)),
    );
  }, [searchQuery, components]);

  return (
    <div className="min-h-screen flex bg-white">
      <PublicSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center px-8 py-3 border-b border-gray-100 bg-white">
          <span className="text-sm text-gray-400">
            <span className="text-gray-900 font-semibold">Marketplace</span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 pt-6 pb-8 flex flex-col gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <span className="text-sm text-gray-500">
            Showing All ({filteredComponents.length})
          </span>

          {filteredComponents.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No public components yet
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {filteredComponents.map((component, i) => (
                <DashboardCard
                  key={i}
                  header={component.name}
                  body={component.description}
                  thumbnail={component.thumbnail}
                  last_updated={component.last_updated}
                  onClick={() =>
                    navigate("/details", {
                      state: {
                        component,
                        teams: [],
                        activeTeam: null,
                        username: "",
                      },
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
