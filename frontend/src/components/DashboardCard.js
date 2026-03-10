export default function DashboardCard({header, body, thumbnail, last_updated, onClick}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow w-[220px]${onClick ? " cursor-pointer" : ""}`}>
      <div className='flex items-center justify-center bg-gray-100 h-[160px] border-b border-gray-200 p-4'>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={header}
            className='w-full h-full object-contain rounded-lg'
          />
        ) : (
          <div className='text-gray-300 text-sm'>No preview</div>
        )}
      </div>
      <div className='px-4 py-3 border-t border-gray-100'>
        <h2 className='text-[14px] font-medium text-gray-900 truncate'>
          {header}
        </h2>
        <p className='text-[12px] text-gray-400 mt-0.5 truncate'>
          {last_updated
            ? `Last edited ${new Date(last_updated).toLocaleDateString()}`
            : body}
        </p>
      </div>
    </div>
  )
}
