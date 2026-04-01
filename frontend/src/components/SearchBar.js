export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search..."
      className="border border-gray-200 rounded-full px-[1rem] py-[0.5rem] text-sm text-gray-700 outline-none placeholder-gray-400 bg-white"
    />
  );
}
