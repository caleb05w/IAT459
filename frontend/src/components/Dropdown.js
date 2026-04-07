import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";

export default function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-4 px-[1rem] py-[0.5rem] border border-gray-200 rounded-full bg-white hover:opacity-80 min-w-[120px] justify-between"
      >
        <h5>{value}</h5>
        <LuChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => { onChange(option); setOpen(false); }}
              className={`w-full text-left px-4 py-2 transition-colors ${
                value === option
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <h5>{option}</h5>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
