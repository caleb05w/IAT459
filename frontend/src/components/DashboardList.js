function formatDateTime(dateStr) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  const date = d.toLocaleDateString("en-US")
  const time = d
    .toLocaleTimeString("en-US", {hour: "numeric", minute: "2-digit"})
    .toLowerCase()
  return `${date} ${time}`
}

export default function DashboardList({
  name,
  thumbnail,
  user,
  last_updated,
  link,
  onClick,
}) {
  return (
    <a
      href={link}
      target='_blank'
      rel='noreferrer'
      onClick={
        onClick
          ? (e) => {
              e.preventDefault()
              onClick()
            }
          : undefined
      }
      className={`grid grid-cols-[180px_1fr_220px] items-center py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-sm -mx-2 px-2${onClick ? " cursor-pointer" : ""}`}>
      {/* Thumbnail */}
      <div className='w-[120px] h-[72px] bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-200'>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className='w-full h-full object-contain'
          />
        ) : (
          <span className='text-gray-300 text-xs'>No preview</span>
        )}
      </div>

      {/* Name */}
      <span className='text-sm text-gray-500 truncate pr-4'>{name}</span>

      {/* Last edited */}
      <div className='flex items-center gap-2'>
        <div className='w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0'>
          {user ? user[0].toUpperCase() : "?"}
        </div>
        <span className='text-sm text-gray-500'>
          {formatDateTime(last_updated)}
        </span>
      </div>
    </a>
  )
}
