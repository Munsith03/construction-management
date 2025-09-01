import express from "express";
import Movement from "../models/Movement.js";

const router = express.Router();

// GET /api/inventory/movements
router.get("/movements", async (_req, res, next) => {
  try {
    const rows = await Movement.find()
      .populate("material", "name unit")
      .sort({ date: -1 })
      .lean();
    res.json(rows);
  } catch (e) { next(e); }
});

export default router;
