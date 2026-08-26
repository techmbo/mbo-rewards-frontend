import { Link, useLocation } from "react-router-dom";
import { findNavItem } from "../../config/navigation";

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const match = findNavItem(pathname);
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-slate-500" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="hover:text-indigo-600">Home</Link>
        </li>
        {match ? (
          <>
            <li>/</li>
            <li className="text-slate-400">{match.section.label}</li>
            <li>/</li>
            <li className="font-medium text-slate-900">{match.item.label}</li>
          </>
        ) : (
          segments.map((seg, idx) => (
            <li key={seg} className="flex items-center gap-2">
              <span>/</span>
              <span className={idx === segments.length - 1 ? "font-medium text-slate-900" : ""}>{seg}</span>
            </li>
          ))
        )}
      </ol>
    </nav>
  );
}
