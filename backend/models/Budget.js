import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    totalBudget: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    currency: { type: String, default: "LKR" },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Budget", BudgetSchema);
