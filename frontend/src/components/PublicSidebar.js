import {Link} from "react-router-dom"

export default function PublicSidebar() {
  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-100 shrink-0 flex flex-col px-6 pt-6">
      <span className="text-sm font-semibold text-gray-900">IAT459</span>

      <nav className="flex flex-col gap-2 mt-[12rem]">
        <Link
          to="/marketplace"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Marketplace
        </Link>
        <Link
          to="/register"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Sign Up
        </Link>
      </nav>
    </aside>
  );
}
