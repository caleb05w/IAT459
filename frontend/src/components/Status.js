const styles = {
  error:   "border-red-300 bg-red-50 text-red-700",
  warning: "border-yellow-300 bg-yellow-50 text-yellow-700",
  confirm: "border-green-300 bg-green-50 text-green-700",
};

const closeStyles = {
  error:   "text-red-400 hover:text-red-700",
  warning: "text-yellow-400 hover:text-yellow-700",
  confirm: "text-green-400 hover:text-green-700",
};

export default function Status({ body, type = "error", onClose }) {
  if (!body) return null;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 w-[448px] flex items-center justify-between gap-4 border px-4 py-3 z-50 ${styles[type]}`}>
      <p className="text-[14px]">{body}</p>
      <button onClick={onClose} className={`transition-colors text-[18px] leading-none ${closeStyles[type]}`}>
        ×
      </button>
    </div>
  );
}
