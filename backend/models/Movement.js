import mongoose from "mongoose";

const MovementSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
    type: { type: String, enum: ["IN", "OUT"], required: true },
    quantity: { type: Number, required: true, min: 0 },
    ref: { type: String, trim: true }, // e.g., "PO-001", "Issue#123"
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Movement", MovementSchema);
