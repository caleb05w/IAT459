export default function SearchBar({value, onChange}) {
  return (
    <div className='flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden'>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Search For...'
        className='flex-1 px-4 py-2 text-sm text-gray-700 outline-none placeholder-gray-400'
      />
      <button className='px-4 py-2 text-sm text-gray-600 bg-gray-100 border-l border-gray-200 hover:bg-gray-200 transition-colors'>
        Search
      </button>
    </div>
  )
}
