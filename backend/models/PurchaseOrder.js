import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PurchaseOrderSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, trim: true, index: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["draft", "ordered", "received", "cancelled"], default: "draft" },
    items: { type: [ItemSchema], default: [] },
  },
  { timestamps: true }
);

// computed total for .toJSON()
PurchaseOrderSchema.virtual("total").get(function () {
  return (this.items || []).reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unitCost || 0), 0);
});
PurchaseOrderSchema.set("toJSON", { virtuals: true });

export default mongoose.model("PurchaseOrder", PurchaseOrderSchema);
