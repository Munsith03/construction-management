import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { materialsApi as api } from "../../services/materials.js";

const empty = { name: "", sku: "", unit: "pcs", onHand: 0, reorderLevel: 0, unitCost: 0, notes: "" };

export default function MaterialForm() {
  const { id } = useParams();
  const isEdit = Boolean(id) && !location.pathname.endsWith("/new");
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try { setErr(""); const d = await api.get(id); setForm({ ...empty, ...d }); }
      catch (e) { setErr(e.message); }
    })();
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const payload = {
        ...form,
        onHand: Number(form.onHand) || 0,
        reorderLevel: Number(form.reorderLevel) || 0,
        unitCost: Number(form.unitCost) || 0,
      };
      if (isEdit) await api.update(id, payload);
      else await api.create(payload);
      navigate("/materials");
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-semibold">{isEdit ? "Edit Material" : "New Material"}</h1>
      {err && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-600">Name</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                   className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">SKU</label>
            <input value={form.sku} onChange={(e) => set("sku", e.target.value)}
                   className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Unit</label>
            <input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="e.g., kg, m, pcs"
                   className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">On Hand</label>
            <input type="number" value={form.onHand} onChange={(e) => set("onHand", e.target.value)}
                   className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Reorder Level</label>
            <input type="number" value={form.reorderLevel} onChange={(e) => set("reorderLevel", e.target.value)}
                   className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Unit Cost</label>
            <input type="number" step="0.01" value={form.unitCost} onChange={(e) => set("unitCost", e.target.value)}
                   className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-slate-600">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-indigo-400" rows={3} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => history.back()} className="rounded-xl border px-4 py-2 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
