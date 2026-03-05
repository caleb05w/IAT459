export default function DashboardCard({
  header,
  body,
  date,
  color,
  deleteItem,
}) {
  return (
    <div
      className="flex items-center justify-between border border-gray-200 px-[18px] py-[18px] w-full"
      style={{ backgroundColor: color || "#ffffff" }}
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-[18px] text-black font-normal">{header}</h2>
        <p className="text-[16px] text-secondary">{body}</p>
      </div>
      <span className="text-[12px] text-secondary whitespace-nowrap">
        {date}
      </span>
      <button
        onClick={deleteItem}
        className="text-[13px] text-white bg-red-500 px-3 py-1"
      >
        Delete
      </button>
    </div>
  );
}
