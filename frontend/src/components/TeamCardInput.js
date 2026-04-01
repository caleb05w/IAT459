import { motion } from "framer-motion";

export default function TeamCardInput({
  username,
  color = "#d9272b",
  name,
  setName,
  url,
  setUrl,
}) {
  const today = new Date()
    .toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, " ");

  const meta = [
    { label: "Owner", value: username || "—" },
    { label: "Date", value: today },
  ];

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 18, mass: 1 }}
    >
      <div
        className="flex flex-col justify-between p-[2rem] w-[18rem] min-h-[25rem] rounded-[1rem] transition-colors duration-200"
        style={{ backgroundColor: color }}
      >
        {/* Top: editable name + url */}
        <div className="flex flex-col gap-1 h-fit">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            className="bg-transparent outline-none border-none text-white placeholder-white/50 font-medium w-full"
            style={{ fontSize: "inherit", fontFamily: "inherit" }}
          />
          <textarea
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            placeholder="Figma URL"
            className="bg-transparent outline-none border-none resize-none overflow-hidden text-white/60 placeholder-white/30 w-full"
            style={{ fontSize: "inherit", fontFamily: "inherit" }}
          />
        </div>

        {/* Bottom: metadata table */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center pr-[0.2px]">
            {meta.map((col) => (
              <div
                key={col.label}
                className="flex flex-[1_0_0] flex-col items-start min-h-px min-w-px mr-[-0.2px] pb-[0.2px]"
              >
                <div className="border-[0.2px] border-solid border-white flex items-center justify-center mb-[-0.2px] px-[9.6px] py-[4px] shrink-0 w-full">
                  <p
                    className="text-white font-bold leading-normal text-[10px] tracking-[-0.12px] whitespace-nowrap"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {col.label}
                  </p>
                </div>
                <div className="border-[0.2px] border-solid border-white flex items-center justify-center mb-[-0.2px] px-[9.6px] py-[4px] shrink-0 w-full">
                  <p
                    className="text-white font-normal leading-normal text-[10px] tracking-[-0.16px] whitespace-nowrap"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {col.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
