// server/models/Project.js
import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // Construction-specific metadata
    client: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },

    // Status & priority
    status: {
      type: String,
      enum: ["Planning", "In Progress", "On Hold", "Completed"],
      default: "Planning",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // Ownership & description
    owner: { type: String, trim: true, default: "Unassigned" },
    description: { type: String, default: "" },

    // Budgeting
    currency: { type: String, default: "LKR" }, // change default if you prefer "USD"
    budget: { type: Number, min: 0, default: 0 },

    // Timeline
    startDate: { type: Date },
    deadline: { type: Date },

    // Execution tracking
    progress: { type: Number, min: 0, max: 100, default: 0 }, // %
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
