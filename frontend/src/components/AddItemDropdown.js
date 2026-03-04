import { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import TextInput from "./TextInput";
import Button from "./Button";

export default function AddItemDropdown({ item, setItem, onSave }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between border border-gray-200 bg-gray-50 px-[18px] py-[18px] text-[16px] text-black w-full"
      >
        <span>Add Item</span>
        <MdOutlineKeyboardArrowDown
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          size={24}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-4 py-[18px]">
          <TextInput
            body="Title"
            placeholder="Title"
            value={item.name}
            onChange={(e) => setItem({ ...item, name: e.target.value })}
          />
          <TextInput
            body="Text"
            placeholder="Text"
            value={item.description}
            onChange={(e) => setItem({ ...item, description: e.target.value })}
          />
          <div className="flex flex-col gap-[0.5rem]">
            <h3 className="text-[16px] text-secondary">Color</h3>
            <div className="flex flex-row gap-2">
              {["#ffffff", "#fca5a5", "#86efac", "#93c5fd", "#fde68a", "#d8b4fe"].map((c) => (
                <button
                  key={c}
                  onClick={() => setItem({ ...item, color: c })}
                  className="w-10 h-10 border"
                  style={{ backgroundColor: c, borderColor: item.color === c ? "#000" : "#d1d5db" }}
                />
              ))}
            </div>
          </div>
          <Button body="Save Item" onClick={() => onSave(item)} />
        </div>
      )}
    </div>
  );
}
