export default function TextInput({ body, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col gap-[0.5rem]">
      <p className="text-secondary">
        {body}
      </p>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-white border px-[18px] py-[18px] text-[16px] text-black placeholder:text-black/60 outline-none"
        style={{ letterSpacing: "-0.4px" }}
      />
    </div>
  );
}
