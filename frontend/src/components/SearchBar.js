export default function SearchBar({value, onChange}) {
  return (
    <div className='flex items-center border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden'>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Search components...'
        className='flex-1 px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400'
      />
    </div>
  )
}
