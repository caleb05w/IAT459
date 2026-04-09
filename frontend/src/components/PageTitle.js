export default function PageTitle({ breadcrumbs = [], onBreadcrumbClick }) {
  return (
    <div className="mb-6 flex items-center gap-1.5 pt-[1rem] pb-[2rem]">
      {breadcrumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <h3 className="opacity-30">/</h3>}
          <h3
            className={`${i === breadcrumbs.length - 1 ? "" : "opacity-40"} ${
              onBreadcrumbClick && i < breadcrumbs.length - 1
                ? "cursor-pointer hover:opacity-70"
                : ""
            }`}
            onClick={() => i < breadcrumbs.length - 1 && onBreadcrumbClick?.(i)}
          >
            {crumb}
          </h3>
        </span>
      ))}
    </div>
  );
}
