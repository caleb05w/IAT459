export default function Topbar({ children }) {
  return (
    <div className='flex items-center justify-end px-8 py-3'>
      {children && <div className='flex items-center gap-3'>{children}</div>}
    </div>
  )
}
