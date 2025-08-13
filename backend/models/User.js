import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // Optional for social login
  isVerified: { type: Boolean, default: false },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  socialId: { type: String }, // For social login
  provider: { type: String }, // e.g., google, github
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
