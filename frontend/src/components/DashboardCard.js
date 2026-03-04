export default function DashboardCard({ header, body, date, color }) {
  return (
    <div
      className="flex items-center justify-between gap-8 border border-gray-200 px-[18px] py-[18px] w-full"
      style={{ backgroundColor: color || "#ffffff" }}
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-[18px] text-black font-normal">{header}</h2>
        <p className="text-[16px] text-secondary">{body}</p>
      </div>
      <span className="text-[12px] text-secondary whitespace-nowrap">
        {date}
      </span>
    </div>
  );
}
