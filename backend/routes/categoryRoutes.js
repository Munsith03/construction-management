import express from "express";
import Category from "../models/Category.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all category routes
router.use(authMiddleware);

// GET all categories
router.get("/", async (req, res) => {
  const items = await Category.find().sort({ createdAt: -1 });
  res.json(items);
});

// POST create category
router.post("/", async (req, res) => {
  try {
    console.log("Received category data:", req.body);
    const { name, budget, description } = req.body;

    // Validate required fields
    if (!name || !budget) {
      return res.status(400).json({
        message: "Missing required fields: name, budget",
      });
    }

    const cat = new Category({
      name,
      budget: Number(budget),
      description,
      spent: 0,
      remaining: Number(budget),
    });

    console.log("Creating category:", cat);
    const savedCategory = await cat.save();
    console.log("Category saved successfully:", savedCategory);
    res.status(201).json(savedCategory);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(400).json({ message: err.message });
  }
});

// PUT update category
router.put("/:id", async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE category
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
