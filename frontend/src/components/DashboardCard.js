import {LuBookmark} from "react-icons/lu"

export default function DashboardCard({
  header,
  body,
  thumbnail,
  last_updated,
  hasUpdate,
  onClick,
  isBookmarked,
  onBookmark,
}) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col rounded-xl overflow-hidden w-[15rem] cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 border border-gray-100"
      style={{ boxShadow: "0 2px 12px 0 rgba(0,0,0,0.05)" }}
    >
      {/* Thumbnail */}
      <div className="relative h-[13rem] bg-[#F6F6F6] flex items-center justify-center p-4">
        {hasUpdate && (
          <p className="absolute top-3 left-3 px-2 py-0.5 bg-black text-white text-xs font-medium rounded-full z-10">
            Update Available
          </p>
        )}
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={header}
            className="w-full h-full object-contain"
          />
        ) : (
          <p className="text-gray-300 text-sm">No preview</p>
        )}
        <button
          onClick={(e) => {e.stopPropagation(); onBookmark?.()}}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/90 hover:bg-white text-gray-400 hover:text-gray-700 transition-colors shadow-sm"
        >
          {isBookmarked
            ? <LuBookmark className="w-3.5 h-3.5 text-black" fill="currentColor" />
            : <LuBookmark className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-white flex flex-col gap-0.5">
        <h5 className="text-gray-900 truncate">{header}</h5>
        <h6 className="text-gray-400 truncate">
          {last_updated
            ? `Last edited ${new Date(last_updated).toLocaleDateString()}`
            : body}
        </h6>
      </div>
    </div>
  )
}
