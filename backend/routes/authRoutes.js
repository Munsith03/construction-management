import express from "express";
import passport from "passport";
import {
  register,
  login,
  verifyOTP,
  getUser,
} from "../controllers/authController.js";
import {
  validateRegister,
  validateLogin,
  validateOTP,
} from "../middlewares/validation.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --------------------
// Local Auth
// --------------------
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/verify-otp", validateOTP, verifyOTP);
router.get("/me", authMiddleware, getUser);

// --------------------
// Google Auth
// --------------------
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/signin",
    session: false,
  }),
  (req, res) => {
    if (!req.user?.token) {
      return res.redirect(`${process.env.FRONTEND_URL}/signin`);
    }
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${req.user.token}`
    );
  }
);

// --------------------
// GitHub Auth
// --------------------
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/signin",
    session: false,
  }),
  (req, res) => {
    if (!req.user?.token) {
      return res.redirect(`${process.env.FRONTEND_URL}/signin`);
    }
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${req.user.token}`
    );
  }
);

export default router;
