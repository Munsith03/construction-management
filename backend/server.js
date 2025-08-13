// server.js or index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
// import passport from "passport";
import { requestLogger, errorHandler } from "./middlewares/logging.js";
// import "./config/passport.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();
const app = express();

app.use(cors()); // This allows all origins during development

// app.use(requestLogger);
app.use(express.json());
//app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
// Routes
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.send("Backend API is running");
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
