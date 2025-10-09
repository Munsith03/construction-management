// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import "./config/passport.js"; // load strategies
import passport from "passport"; // import passport

// routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";

// ✅ Seeder
import seedSuperAdmin from "./seeds/seedSuperAdmin.js";

dotenv.config();

// 1) init app FIRST
const app = express();

// 2) core middlewares
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(passport.initialize()); // ✅ NOW app exists

app.get("/", (_req, res) => res.send("Backend API is running"));

// 3) health
app.get("/health", (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// 4) routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/staff", staffRoutes);

// 5) start server after DB connects
const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    await seedSuperAdmin(); // auto-seed before server starts

    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("DB connect failed:", err);
    process.exit(1);
  }
};

startServer();
