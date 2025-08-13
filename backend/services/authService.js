import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const registerUser = async (email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  await OTP.create({ email, code: otp, expiresAt });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
  });

  return user;
};

export const verifyOTP = async (email, code) => {
  const otpRecord = await OTP.findOne({ email, code });
  if (!otpRecord) throw new Error("Invalid OTP");
  if (otpRecord.expiresAt < new Date()) throw new Error("OTP expired");

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  user.isVerified = true;
  await user.save();
  await OTP.deleteMany({ email });

  return user;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  if (!user.isVerified && !user.socialId) throw new Error("Email not verified");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return { token, user };
};
