// server/models/Project.js
import mongoose from "mongoose";

const WeatherSchema = new mongoose.Schema(
  {
    tempC: Number,
    windKph: Number,
    code: Number,
    description: String,
    fetchedAt: Date,
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    client: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },

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

    owner: { type: String, trim: true, default: "Unassigned" },
    description: { type: String, default: "" },

    currency: { type: String, default: "LKR" },
    budget: { type: Number, min: 0, default: 0 },

    startDate: { type: Date },
    deadline: { type: Date },

    progress: { type: Number, min: 0, max: 100, default: 0 },

    // Map + Weather
    lat: { type: Number },
    lon: { type: Number },
    weather: { type: WeatherSchema, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
