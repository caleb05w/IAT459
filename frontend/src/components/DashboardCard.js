export default function DashboardCard({
  header,
  body,
  thumbnail,
  last_updated,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col rounded-[0.5rem] overflow-hidden w-[16rem] hover:cursor-pointer`}
      style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.06)" }}
    >
      <div className="flex h-[16rem] p-4">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={header}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <div className="text-gray-300 text-sm">No preview</div>
        )}
      </div>
      <div className="px-4 pt-3 pb-2">
        <h5 className="text-gray-900 truncate">{header}</h5>
      </div>
      <div
        className="h-[1px] w-80 mx-auto"
        style={{
          background:
            "repeating-linear-gradient(90deg, #E2E1DD 0, #E2E1DD 3px, transparent 3px, transparent 8px)",
        }}
      ></div>
      <div className="px-4 pt-2 pb-3">
        <h2 className="text-[12px] text-gray-400 truncate">
          {last_updated
            ? `Last edited ${new Date(last_updated).toLocaleDateString()}`
            : body}
        </h2>
      </div>
    </div>
  );
}
