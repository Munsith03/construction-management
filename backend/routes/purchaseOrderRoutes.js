import express from "express";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Material from "../models/Material.js";
import Movement from "../models/Movement.js";

const router = express.Router();

// List POs (frontend only needs GET)
router.get("/", async (_req, res, next) => {
  try {
    const rows = await PurchaseOrder.find()
      .populate("supplier", "name")
      .populate("items.material", "name unit")
      .sort({ date: -1 })
      .lean({ virtuals: true });
    res.json(rows);
  } catch (e) { next(e); }
});

// OPTIONAL: create + receive that updates stock & movements
router.post("/", async (req, res, next) => {
  try {
    const po = await PurchaseOrder.create(req.body);
    res.status(201).json(po.toJSON());
  } catch (e) { next(e); }
});

router.post("/:id/receive", async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: "PO not found" });
    if (po.status === "received") return res.json(po);

    // increment stock for each item + record movements
    for (const it of po.items) {
      await Material.findByIdAndUpdate(it.material, { $inc: { onHand: it.quantity } });
      await Movement.create({
        material: it.material,
        type: "IN",
        quantity: it.quantity,
        ref: po.number,
        note: "PO received",
      });
    }
    po.status = "received";
    await po.save();
    res.json(po.toJSON());
  } catch (e) { next(e); }
});

export default router;
