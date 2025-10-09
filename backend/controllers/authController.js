// controllers/authController.js
import {
  registerUser,
  loginUser,
  verifyOTP as verifyOTPService,
} from "../services/authService.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

/**
 * Register user with email/password
 */
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    await registerUser(email, password);
    res.status(201).json({ message: "User registered. OTP sent to email." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Login user with email/password
 */
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

/**
 * Verify OTP
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;
    await verifyOTPService(email, code);
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get current user
 */
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "roles",
        select: "name permissions",
        populate: {
          path: "permissions",
          select: "name description",
        },
      });
    if (!user) throw new Error("User not found");
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * ✅ Google OAuth callback
 * Passport will attach req.user → we send token + redirect to frontend
 */
export const googleCallback = async (req, res) => {
  try {
    const user = req.user; // set by passport.js

    if (!user) {
      return res.status(401).json({ error: "Google login failed" });
    }

    // If passport.js already created token, use it
    const token = user.token || generateToken(user);

    // Redirect back to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
