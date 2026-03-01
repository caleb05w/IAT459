export default function Button({ body, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-black text-white px-[18px] py-[18px] text-[16px] w-fit hover:bg-black/80 transition-colors"
      style={{ letterSpacing: "-0.4px" }}
    >
      {body}
    </button>
  );
}
