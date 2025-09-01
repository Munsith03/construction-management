import Movement from "../models/Movement.js";

export const listMovements = async (_req, res, next) => {
  try {
    const rows = await Movement.find()
      .populate("material", "name unit")
      .sort({ date: -1 })
      .lean();
    res.json(rows);
  } catch (e) { next(e); }
};

