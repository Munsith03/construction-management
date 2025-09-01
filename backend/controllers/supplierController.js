import Supplier from "../models/Supplier.js";

export const listSuppliers = async (_req, res, next) => {
  try {
    const rows = await Supplier.find().sort({ name: 1 }).lean();
    res.json(rows);
  } catch (e) { next(e); }
};
