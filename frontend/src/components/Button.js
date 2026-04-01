export default function Button({ body, onClick, size = "lg", style = "primary", bg, type = "button" }) {
  const padding = size === "sm" ? "px-[1rem] py-[0.5rem]" : "px-[1.5rem] py-[1rem]"
  const bgColor = bg ?? (style === "none" ? "bg-transparent" : style === "secondary" ? "bg-gray-200" : style === "tertiary" ? "bg-tertiary" : style === "danger" ? "bg-red-500" : "bg-black")
  const textColor = bg ? "text-white" : (style === "none" || style === "secondary" || style === "tertiary" ? "text-black" : "text-white")

  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-full w-fit hover:opacity-80 hover:transition-opacity ${padding} ${bgColor} ${textColor}`}
    >
      <h5>{body}</h5>
    </button>
  );
}
