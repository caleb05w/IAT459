import {LuBookmark} from "react-icons/lu"

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-US");
  const time = d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
  return `${date} ${time}`;
}

export default function DashboardList({
  name,
  thumbnail,
  user,
  last_updated,
  link,
  onClick,
  isBookmarked,
  onBookmark,
}) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      onClick={
        onClick
          ? (e) => {
              e.preventDefault();
              onClick();
            }
          : undefined
      }
      className={`grid grid-cols-[180px_1fr_220px_40px] items-center px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors${onClick ? " cursor-pointer" : ""}`}
    >
      {/* Thumbnail */}
      <div className="w-[160px] h-[72px] bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-200">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="w-full h-full object-contain"
          />
        ) : (
          <p className="text-gray-300 text-xs">No preview</p>
        )}
      </div>

      {/* Name */}
      <p className="text-sm text-gray-500 truncate pr-4">{name}</p>

      {/* Last edited */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {user ? user[0].toUpperCase() : "?"}
        </div>
        <p className="text-sm text-gray-500">
          {formatDateTime(last_updated)}
        </p>
      </div>

      {/* Bookmark */}
      <div className="flex items-center justify-center">
        <button
          onClick={(e) => {e.stopPropagation(); e.preventDefault(); onBookmark?.()}}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          {isBookmarked
            ? <LuBookmark className="w-4 h-4 text-black" fill="currentColor" />
            : <LuBookmark className="w-4 h-4" />}
        </button>
      </div>
    </a>
  );
}
