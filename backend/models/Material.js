import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, index: true, unique: false },
    unit: { type: String, default: "pcs" },
    onHand: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 0 },
    unitCost: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Material", MaterialSchema);
