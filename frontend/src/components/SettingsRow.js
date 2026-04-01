import Button from "./Button";

export default function SettingsRow({ title, description, buttonLabel, buttonStyle = "primary", onAction, children }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border border-gray-200 rounded-xl w-full">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      {children ?? (
        buttonLabel && (
          <Button body={buttonLabel} size="sm" style={buttonStyle} onClick={onAction} />
        )
      )}
    </div>
  );
}
