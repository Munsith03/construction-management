import Material from "../models/Material.js";

export const listMaterials = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const filter = q
      ? { $or: [{ name: new RegExp(q, "i") }, { sku: new RegExp(q, "i") }] }
      : {};
    const rows = await Material.find(filter).sort({ updatedAt: -1 }).lean();
    res.json(rows);
  } catch (e) { next(e); }
};

export const getMaterial = async (req, res, next) => {
  try {
    const m = await Material.findById(req.params.id).lean();
    if (!m) return res.status(404).json({ message: "Not found" });
    res.json(m);
  } catch (e) { next(e); }
};

export const createMaterial = async (req, res, next) => {
  try {
    const created = await Material.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const updateMaterial = async (req, res, next) => {
  try {
    const updated = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (e) { next(e); }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const ok = await Material.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.status(204).end();
  } catch (e) { next(e); }
};
