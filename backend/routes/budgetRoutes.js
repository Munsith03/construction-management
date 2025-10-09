import express from "express";
import Budget from "../models/Budget.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all budget routes
router.use(authMiddleware);

// GET all budgets
router.get("/", async (req, res) => {
  const items = await Budget.find().sort({ createdAt: -1 });
  res.json(items);
});

// POST create budget
router.post("/", async (req, res) => {
  try {
    console.log("Received budget data:", req.body);
    const {
      projectName,
      totalBudget,
      startDate,
      endDate,
      status,
      projectId,
      currency,
      description,
    } = req.body;

    // Validate required fields
    if (!projectName || !totalBudget || !startDate || !endDate) {
      return res.status(400).json({
        message:
          "Missing required fields: projectName, totalBudget, startDate, endDate",
      });
    }

    const budget = new Budget({
      projectName,
      totalBudget: Number(totalBudget),
      spent: 0,
      remaining: Number(totalBudget),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || "Active",
      projectId: projectId && projectId.trim() !== "" ? projectId : null,
      currency: currency || "LKR",
      description,
    });

    console.log("Creating budget:", budget);
    const savedBudget = await budget.save();
    console.log("Budget saved successfully:", savedBudget);
    res.status(201).json(savedBudget);
  } catch (err) {
    console.error("Error creating budget:", err);
    res.status(400).json({ message: err.message });
  }
});

// PUT update budget
router.put("/:id", async (req, res) => {
  try {
    console.log("Updating budget with ID:", req.params.id);
    console.log("Update data:", req.body);

    const {
      projectName,
      totalBudget,
      startDate,
      endDate,
      status,
      projectId,
      currency,
      description,
    } = req.body;

    // Validate required fields
    if (!projectName || !totalBudget || !startDate || !endDate) {
      return res.status(400).json({
        message:
          "Missing required fields: projectName, totalBudget, startDate, endDate",
      });
    }

    const updateData = {
      projectName,
      totalBudget: Number(totalBudget),
      spent: 0, // Keep spent as 0 for now, could be calculated separately
      remaining: Number(totalBudget), // Recalculate remaining
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || "Active",
      projectId: projectId && projectId.trim() !== "" ? projectId : null,
      currency: currency || "LKR",
      description,
    };

    console.log("Updating budget with data:", updateData);
    const budget = await Budget.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    console.log("Budget updated successfully:", budget);
    res.json(budget);
  } catch (err) {
    console.error("Error updating budget:", err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE budget
router.delete("/:id", async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
