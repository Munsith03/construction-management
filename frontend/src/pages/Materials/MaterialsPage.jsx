// src/pages/Materials/MaterialsPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

async function request(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

// money + qty helpers
const money = (n, c = "LKR") => {
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(Number(n) || 0); }
  catch { return `${c} ${Number(n || 0).toLocaleString()}`; }
};
const qty = (n, u = "") => Number.isFinite(Number(n)) ? `${Number(n)}${u ? " " + u : ""}` : "-";

// ---- One component does it all ----
export default function MaterialsPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // form state (for create/edit)
  const empty = { name: "", sku: "", unit: "pcs", onHand: 0, reorderLevel: 0, unitCost: 0, notes: "" };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const isEdit = Boolean(editingId);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const data = await request(`/materials${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [q]);

  function openCreate() {
    setForm(empty);
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(rec) {
    setForm({
      name: rec.name ?? "",
      sku: rec.sku ?? "",
      unit: rec.unit ?? "pcs",
      onHand: rec.onHand ?? 0,
      reorderLevel: rec.reorderLevel ?? 0,
      unitCost: rec.unitCost ?? 0,
      notes: rec.notes ?? "",
    });
    setEditingId(rec._id);
    setOpen(true);
  }

  async function onDelete(id) {
    if (!confirm("Delete this material?")) return;
    try {
      await request(`/materials/${id}`, { method: "DELETE" });
      setRows((r) => r.filter((x) => x._id !== id));
    } catch (e) { alert(e.message); }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    const payload = {
      ...form,
      onHand: Number(form.onHand) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      unitCost: Number(form.unitCost) || 0,
    };
    try {
      if (isEdit) {
        const updated = await request(`/materials/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
        setRows((r) => r.map((x) => (x._id === editingId ? updated : x)));
      } else {
        const created = await request(`/materials`, { method: "POST", body: JSON.stringify(payload) });
        setRows((r) => [created, ...r]);
      }
      setOpen(false);
      setForm(empty);
      setEditingId(null);
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  const data = useMemo(() => rows, [rows]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <section className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Materials</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or SKU…"
              className="w-64 rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">On Hand</th>
              <th className="px-4 py-3">Reorder</th>
              <th className="px-4 py-3">Unit Cost</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No materials.</td></tr>
            ) : data.map((m) => (
              <tr key={m._id} className="border-t">
                <td className="px-4 py-3">{m.name || "-"}</td>
                <td className="px-4 py-3">{m.sku || "-"}</td>
                <td className="px-4 py-3">{m.unit || "-"}</td>
                <td className="px-4 py-3">{qty(m.onHand, m.unit)}</td>
                <td className="px-4 py-3">{qty(m.reorderLevel, m.unit)}</td>
                <td className="px-4 py-3">{money(m.unitCost)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(m)}
                      className="rounded-lg border px-2 py-1 hover:bg-slate-50"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(m._id)}
                      className="rounded-lg border px-2 py-1 hover:bg-slate-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer/Modal for Create/Edit */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-2xl border bg-white shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">{isEdit ? "Edit Material" : "New Material"}</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">SKU</label>
                  <input
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Unit</label>
                  <input
                    value={form.unit}
                    onChange={(e) => set("unit", e.target.value)}
                    placeholder="e.g., kg, m, pcs"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">On Hand</label>
                  <input
                    type="number"
                    value={form.onHand}
                    onChange={(e) => set("onHand", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Reorder Level</label>
                  <input
                    type="number"
                    value={form.reorderLevel}
                    onChange={(e) => set("reorderLevel", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Unit Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.unitCost}
                    onChange={(e) => set("unitCost", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm text-slate-600">Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : isEdit ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border px-4 py-2 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
