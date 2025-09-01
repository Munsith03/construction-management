// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

// routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";

// middlewares (optional)
// import { requestLogger, errorHandler } from "./middlewares/logging.js";

dotenv.config();

// 1) init app FIRST
const app = express();

// 2) core middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
// app.use(requestLogger);

// 3) health
app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// 4) routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);

app.use("/api/materials", materialRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/inventory", inventoryRoutes);

app.get("/", (_req, res) => res.send("Backend API is running"));

// 5) error handler LAST (optional)
// app.use(errorHandler);

// 6) start server after DB connects
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}).catch((err) => {
  console.error("DB connect failed:", err);
  process.exit(1);
});
