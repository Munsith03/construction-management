import {
  registerUser,
  loginUser,
  verifyOTP as verifyOTPService,
} from "../services/authService.js";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    await registerUser(email, password);
    res.status(201).json({ message: "User registered. OTP sent to email." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);

    res.json({
      token,
      user: { email: user.email, isVerified: user.isVerified },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;
    await verifyOTPService(email, code);
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "roles",
        select: "name permissions", // Only fetch name and permissions
        populate: {
          path: "permissions",
          select: "name description", // Populate permissions if needed
        },
      });
    if (!user) throw new Error("User not found");
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
