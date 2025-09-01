import express from "express";
import Supplier from "../models/Supplier.js";

const router = express.Router();

// minimal list for frontend
router.get("/", async (_req, res, next) => {
  try {
    const rows = await Supplier.find().sort({ name: 1 }).lean();
    res.json(rows);
  } catch (e) { next(e); }
});

export default router;
