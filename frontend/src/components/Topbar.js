export default function Topbar({breadcrumbs = [], children}) {
  return (
    <div className='flex items-center justify-between px-8 py-3 border-b border-gray-100 bg-white'>
      <span className='text-sm text-gray-400'>
        {breadcrumbs.map((crumb, i) => (
          <span key={i}>
            {i > 0 && " / "}
            {i === breadcrumbs.length - 1 ? (
              <span className='text-gray-900 font-semibold'>{crumb}</span>
            ) : (
              crumb
            )}
          </span>
        ))}
      </span>
      {children && <div className='flex items-center gap-3'>{children}</div>}
    </div>
  )
}
