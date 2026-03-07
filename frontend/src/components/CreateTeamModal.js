import {useState} from "react"
import {FiX} from "react-icons/fi"

export default function CreateTeamModal({onClose, onSubmit}) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!name.trim()) return setError("Team name is required.")
    if (!url.trim()) return setError("URL is required.")

    // basic url validation
    try {
      new URL(url)
    } catch {
      return setError("Please enter a valid URL.")
    }

    setError("")
    setLoading(true)
    await onSubmit({name, url})
    setLoading(false)
    onClose()
  }

  return (
    // backdrop
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
      onClick={onClose}>
      {/* modal — stop click from closing when clicking inside */}
      <div
        className='relative w-full max-w-md bg-white rounded-2xl shadow-2xl px-8 py-7'
        onClick={(e) => e.stopPropagation()}>
        {/* close button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors border-none bg-transparent cursor-pointer'>
          <FiX size={16} />
        </button>

        {/* header */}
        <h2 className='text-[17px] font-semibold text-gray-900 mb-1'>
          Create a team
        </h2>
        <p className='text-[13px] text-gray-400 mb-6'>
          Give your team a name and link a project URL.
        </p>

        {/* fields */}
        <div className='flex flex-col gap-4'>
          <div>
            <label className='block text-[12px] font-medium text-gray-600 mb-1.5'>
              Team name
            </label>
            <input
              type='text'
              placeholder='e.g. IAT459 Group'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-3.5 py-2.5 text-[13px] text-gray-800 border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors placeholder-gray-300'
            />
          </div>

          <div>
            <label className='block text-[12px] font-medium text-gray-600 mb-1.5'>
              Project URL
            </label>
            <input
              type='url'
              placeholder='https://github.com/your-project'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className='w-full px-3.5 py-2.5 text-[13px] text-gray-800 border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors placeholder-gray-300'
            />
          </div>

          {/* inline error */}
          {error && <p className='text-[12px] text-red-500 -mt-1'>{error}</p>}
        </div>

        {/* actions */}
        <div className='flex justify-end gap-2.5 mt-7'>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded-xl text-[13px] font-medium text-gray-500 hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer'>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className='px-5 py-2 rounded-xl text-[13px] font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors border-none cursor-pointer disabled:opacity-50'>
            {loading ? "Creating…" : "Create team"}
          </button>
        </div>
      </div>
    </div>
  )
}
