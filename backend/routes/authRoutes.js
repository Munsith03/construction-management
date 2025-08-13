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

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/verify-otp", validateOTP, verifyOTP);
router.get("/me", authMiddleware, getUser);

// Social Auth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${req.user.token}`
    );
  }
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${req.user.token}`
    );
  }
);

// router.get(
//   "/facebook",
//   passport.authenticate("facebook", { scope: ["email"] })
// );
// router.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", { session: false }),
//   (req, res) => {
//     res.redirect(
//       `${process.env.FRONTEND_URL}/auth/callback?token=${req.user.token}`
//     );
//   }
// );

// router.get("/apple", passport.authenticate("apple"));
// router.post(
//   "/apple/callback",
//   passport.authenticate("apple", { session: false }),
//   (req, res) => {
//     res.redirect(
//       `${process.env.FRONTEND_URL}/auth/callback?token=${req.user.token}`
//     );
//   }
// );

export default router;
