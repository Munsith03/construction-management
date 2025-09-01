import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";


const fmtMoney = (n, currency = "LKR") => {
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(n) || 0); }
  catch { return `${currency} ${Number(n || 0).toLocaleString()}`; }
};
const fmtQty = (n, unit = "") => Number.isFinite(Number(n)) ? `${Number(n)}${unit ? " " + unit : ""}` : "-";

export default function MaterialDetail() {
  const { id } = useParams();
  const [m, setM] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try { setErr(""); setM(await api.get(id)); }
      catch (e) { setErr(e.message); }
    })();
  }, [id]);

  if (err) return <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>;
  if (!m) return <div className="text-slate-500">Loading…</div>;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{m.name}</h1>
        <Link to={`/materials/${m._id}/edit`} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">Edit</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4">
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <dt className="text-slate-500">SKU</dt><dd className="col-span-2 font-medium">{m.sku || "-"}</dd>
            <dt className="text-slate-500">Unit</dt><dd className="col-span-2 font-medium">{m.unit || "-"}</dd>
            <dt className="text-slate-500">On Hand</dt><dd className="col-span-2 font-medium">{fmtQty(m.onHand, m.unit)}</dd>
            <dt className="text-slate-500">Reorder Level</dt><dd className="col-span-2 font-medium">{fmtQty(m.reorderLevel, m.unit)}</dd>
            <dt className="text-slate-500">Unit Cost</dt><dd className="col-span-2 font-medium">{fmtMoney(m.unitCost)}</dd>
          </dl>
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="mb-2 text-sm font-semibold">Notes</p>
          <p className="text-sm text-slate-600">{m.notes || "—"}</p>
        </div>
      </div>
    </section>
  );
}
