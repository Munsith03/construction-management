// seed.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import Material from "./models/Material.js";
import Supplier from "./models/Supplier.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to DB");

    // clear old data
    await Material.deleteMany({});
    await Supplier.deleteMany({});

    // insert demo suppliers
    await Supplier.create([
      { name: "BuildMart Pvt Ltd", email: "info@buildmart.lk", phone: "011-1234567" },
      { name: "MegaSupplies", email: "hello@megasupplies.com" },
    ]);

    // insert demo materials
    await Material.create([
      { name: "Cement", sku: "CEM-42", unit: "bag", onHand: 120, reorderLevel: 50, unitCost: 1450 },
      { name: "Sand", sku: "SAND-01", unit: "m³", onHand: 30, reorderLevel: 10, unitCost: 6000 },
      { name: "Rebar 10mm", sku: "RB10", unit: "kg", onHand: 800, reorderLevel: 300, unitCost: 310 },
    ]);

    console.log("🌱 Seed OK");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

run();
