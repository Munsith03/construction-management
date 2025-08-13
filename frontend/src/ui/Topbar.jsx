export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/70 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden inline-flex items-center rounded-lg border px-3 py-2 text-sm"
          onClick={() => alert("Hook this to open a mobile drawer")}
        >
          ☰
        </button>
        <h1 className="text-base font-semibold">Overview</h1>
      </div>

      <div className="flex items-center gap-2">
        <input
          className="w-56 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
          placeholder="Search…"
        />
        <img
          src={`https://api.dicebear.com/9.x/initials/svg?seed=UX`}
          alt="avatar"
          className="h-8 w-8 rounded-full border"
        />
      </div>
    </header>
  );
}
