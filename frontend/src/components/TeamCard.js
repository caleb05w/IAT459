export default function TeamCard({
  name,
  description,
  owner,
  date,
  role,
  bg = "bg-[#d9272b]",
  onClick,
}) {
  const formattedDate = date
    ? new Date(date)
        .toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, " ")
    : "—";

  const meta = [
    { label: "Owner", value: owner || "—" },
    { label: "Date", value: formattedDate },
  ];

  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-between p-[2rem] ${bg} max-w-[18rem] w-[18rem] h-fit min-h-[25rem] rounded-[1rem] ${onClick ? "cursor-pointer" : ""} hover:opacity-90 transition-opacity`}
    >
      {/* Top: name + description */}
      <div className="flex flex-col gap-1">
        <p className="text-white font-medium">{name}</p>
        <p className="text-white opacity-60">{description}</p>
      </div>

      {/* Bottom: metadata table */}
      <div className="flex items-center pr-[0.2px]">
        {meta.map((col) => (
          <div
            key={col.label}
            className="flex flex-[1_0_0] flex-col items-start min-h-px min-w-px mr-[-0.2px] pb-[0.2px]"
          >
            <div className="border-[0.2px] border-solid border-white flex items-center justify-center mb-[-0.2px] px-[9.6px] py-[4px] shrink-0 w-full">
              <h6
                className="text-white font-bold leading-normal tracking-[-0.12px] whitespace-nowrap"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {col.label}
              </h6>
            </div>
            <div className="border-[0.2px] border-solid border-white flex items-center justify-center mb-[-0.2px] px-[9.6px] py-[4px] shrink-0 w-full">
              <h6
                className="text-white leading-normal tracking-[-0.16px] whitespace-nowrap"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {col.value}
              </h6>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
