import { NavLink } from "react-router-dom";

const linkBase =
  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition";
const linkIdle = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
const linkActive = "bg-slate-900 text-white";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex h-screen sticky top-0 w-64 flex-col border-r bg-white/80 backdrop-blur">
      <div className="p-4 border-b">
        <span className="text-lg font-semibold">My Dashboard</span>
      </div>

      <nav className="p-3 space-y-1">
        <NavLink end to="." className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
          <span>🏠</span> <span>Overview</span>
        </NavLink>

        <NavLink to="projects" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
          <span>📁</span> <span>Projects</span>
        </NavLink>

        {/* ✅ New: Materials */}
        <NavLink to="Materials" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
          <span>📦</span> <span>Materials</span>
        </NavLink>

        <NavLink to="tasks" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
          <span>✅</span> <span>Tasks</span>
        </NavLink>

        <NavLink to="settings" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
          <span>⚙️</span> <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}
