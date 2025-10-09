import express from "express";
import Expense from "../models/Expense.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all expense routes
router.use(authMiddleware);

// GET all expenses
router.get("/", async (req, res) => {
  const items = await Expense.find().sort({ createdAt: -1 });
  res.json(items);
});

// POST create expense
router.post("/", async (req, res) => {
  try {
    console.log("Received expense data:", req.body);
    const {
      projectId,
      description,
      amount,
      category,
      date,
      status,
      currency,
      notes,
    } = req.body;

    // Validate required fields
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        message: "Missing required fields: description, amount, category, date",
      });
    }

    const expense = new Expense({
      projectId: projectId && projectId.trim() !== "" ? projectId : null,
      description,
      amount: Number(amount),
      category,
      date: new Date(date),
      status: status || "Pending",
      currency: currency || "LKR",
      notes,
    });

    console.log("Creating expense:", expense);
    const savedExpense = await expense.save();
    console.log("Expense saved successfully:", savedExpense);
    res.status(201).json(savedExpense);
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(400).json({ message: err.message });
  }
});

// PUT update expense
router.put("/:id", async (req, res) => {
  try {
    console.log("Updating expense with ID:", req.params.id);
    console.log("Update data:", req.body);

    const {
      projectId,
      description,
      amount,
      category,
      date,
      status,
      currency,
      notes,
    } = req.body;

    // Validate required fields
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        message: "Missing required fields: description, amount, category, date",
      });
    }

    const updateData = {
      projectId: projectId && projectId.trim() !== "" ? projectId : null,
      description,
      amount: Number(amount),
      category,
      date: new Date(date),
      status: status || "Pending",
      currency: currency || "LKR",
      notes,
    };

    console.log("Updating expense with data:", updateData);
    const expense = await Expense.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    console.log("Expense updated successfully:", expense);
    res.json(expense);
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE expense
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
