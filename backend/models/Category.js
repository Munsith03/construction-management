import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    budget: { type: Number, required: true },
    description: { type: String },
    spent: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
