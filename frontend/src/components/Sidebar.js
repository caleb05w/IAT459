import React, { useContext } from "react";
import { toSlug } from "../utils/toSlug";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";
import {
  LuHouse,
  LuLayoutGrid,
  LuBookmark,
  LuSettings,
  LuStore,
  LuChevronRight,
} from "react-icons/lu";

const NAV_ITEMS = [
  { label: "Overview", icon: LuHouse, path: "/overview" },
  { label: "Components", icon: LuLayoutGrid, path: "/:teamid" },
  { label: "Team Settings", icon: LuSettings, path: "/settings" },
  { label: "Bookmarks", icon: LuBookmark, path: "/bookmarks" },
  { label: "Marketplace", icon: LuStore, path: "/marketplace" },
];

export default function Sidebar({
  activeNav,
  setActiveNav,
  activeTeam,
  username,
}) {
  const { token } = useContext(AuthContext);
  const { currentUserRole, userProfile } = useContext(DataContext);
  const displayName = userProfile?.fName
    ? userProfile.lName
      ? `${userProfile.fName} ${userProfile.lName[0]}`
      : userProfile.fName
    : username;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getActiveNav = () => {
    if (pathname === "/overview") return "Overview";
    if (pathname.endsWith("/settings")) return "Team Settings";
    if (pathname.endsWith("/details")) return "Components";
    if (pathname === "/bookmarks") return "Bookmarks";
    if (pathname === "/marketplace") return "Marketplace";
    if (pathname.startsWith("/team/")) return "Components";
    return "";
  };

  const currentNav = activeNav ?? getActiveNav();

  // Hide team-specific nav items when not logged in — Marketplace is always visible
  const AUTHED_ONLY = ["Overview", "Components", "Team Settings", "Bookmarks"];
  // These require an active team selection
  const TEAM_REQUIRED = ["Overview", "Components", "Team Settings"];
  const visibleNavItems = NAV_ITEMS.filter(({ label }) => {
    if (!token && AUTHED_ONLY.includes(label)) return false;
    if (!activeTeam && TEAM_REQUIRED.includes(label)) return false;
    return true;
  });

  const handleNavClick = (label, path) => {
    setActiveNav?.(label);
    if (label === "Overview") {
      navigate("/overview");
    } else if (label === "Components" && activeTeam) {
      navigate(`/team/${toSlug(activeTeam.name)}`);
    } else if (label === "Team Settings" && activeTeam) {
      navigate(`/team/${toSlug(activeTeam.name)}/settings`);
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <>
      <div className="w-56 shrink-0" />
      <aside className="fixed top-0 left-0 w-56 h-screen bg-white flex flex-col border-r border-gray-100 z-40 pt-[1rem]">
        {/* Brand */}
        <div
          className="px-[1.5rem] pt-5 pb-3 cursor-pointer"
          onClick={() => navigate("/teams")}
        >
          <h3>{activeTeam?.name || "IAT459"}</h3>
        </div>

        {/* Nav items */}
        <nav className="flex-1 pt-2 flex flex-col gap-[0.25rem] px-6 mt-[1rem]">
          {visibleNavItems.map(({ label, icon: Icon, path }) => (
            <React.Fragment key={label}>
              {label === "Bookmarks" && (
                <div className="my-1 border-t border-gray-200" />
              )}
              <button
                onClick={() => handleNavClick(label, path)}
                className={`w-full flex items-center gap-[0.5rem] py-2.5 rounded-xl text-sm transition-colors text-left ${
                  currentNav === label
                    ? "text-black"
                    : "text-secondary hover:text-black"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            </React.Fragment>
          ))}
        </nav>

        {/* Go Back */}
        {/* <div className='px-3 pb-4'>
        <button className='flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 cursor-default'>
          <LuArrowLeft className='w-4 h-4' />
          Go Back
        </button>
      </div> */}

        {/* User footer */}
        <button
          onClick={() => navigate("/profile")}
          className="mx-3 mb-3 px-3 py-2.5 rounded-xl border border-gray-100 flex items-center gap-3 w-[calc(100%-1.5rem)] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {userProfile?.fName
              ? `${userProfile.fName[0]}${userProfile.lName ? userProfile.lName[0] : ""}`.toUpperCase()
              : username
                ? username[0].toUpperCase()
                : "?"}
          </div>
          <div className="min-w-0 text-left flex-1">
            <p className="text-sm font-medium text-gray-700 truncate">
              {displayName}
            </p>
            <h6 className="text-gray-400">{currentUserRole || "..."}</h6>
          </div>
          <LuChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
        </button>
      </aside>
    </>
  );
}
