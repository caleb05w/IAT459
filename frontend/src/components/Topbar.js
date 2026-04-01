export default function Topbar({ breadcrumbs = [], onBreadcrumbClick, logo, children }) {
  return (
    <div className='flex items-center justify-between px-8 py-3'>
      <div className='flex items-center gap-2 tracking-[-0.16px]'>
        {logo && logo}
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className='flex items-center gap-2'>
            {i > 0 && <h5 className='opacity-40'>/</h5>}
            <h5
              className={`${i === breadcrumbs.length - 1 ? 'opacity-100' : 'opacity-40'} ${onBreadcrumbClick ? 'cursor-pointer hover:opacity-70' : ''}`}
              onClick={() => onBreadcrumbClick?.(i)}
            >
              {crumb}
            </h5>
          </span>
        ))}
      </div>
      {children && <div className='flex items-center gap-3'>{children}</div>}
    </div>
  )
}
