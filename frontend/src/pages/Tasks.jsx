export default function Tasks() {
  const tasks = [
    { id: "t1", title: "Design login screen", due: "2025-08-20", done: false },
    { id: "t2", title: "Set up CI", due: "2025-08-16", done: true },
    { id: "t3", title: "Write API docs", due: "2025-08-25", done: false },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Tasks</h2>
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr className="border-b">
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b last:border-none">
                <td className="px-4 py-3">{t.title}</td>
                <td className="px-4 py-3">{t.due}</td>
                <td className="px-4 py-3">
                  <span className="rounded-lg border px-2 py-1 text-xs">
                    {t.done ? "Done" : "Open"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="rounded-lg border px-3 py-1">
                      Toggle
                    </button>
                    <button className="rounded-lg border px-3 py-1">
                      Edit
                    </button>
                    <button className="rounded-lg border px-3 py-1">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
