export default function Table({
  columns,
  rows,
  colWidths,
  emptyMessage = "No data found",
  size = "normal",
}) {
  const gridStyle = {
    gridTemplateColumns: colWidths ?? `repeat(${columns.length}, 1fr)`,
  };

  const Label = size === "small" ? "h6" : "p"

  return (
    <div className="border border-gray-200 rounded-xl">
      {/* Header */}
      <div
        className="grid px-4 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-xl"
        style={gridStyle}
      >
        {columns.map((col) => (
          <Label key={col.key} className="text-xs font-medium text-gray-500">
            {col.label}
          </Label>
        ))}
      </div>

      {/* Rows */}
      {rows.length === 0 ? (
        <Label className="px-4 py-8 text-center text-sm text-gray-400">
          {emptyMessage}
        </Label>
      ) : (
        rows.map((row) => (
          <div
            key={row._id}
            className="grid px-4 py-3 border-b border-gray-100 last:border-0 last:rounded-b-xl items-center"
            style={gridStyle}
          >
            {columns.map((col) => (
              <div key={col.key}>{col.render(row, size)}</div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
