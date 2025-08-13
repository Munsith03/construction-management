import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as AppleStrategy } from "passport-apple";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            isVerified: true,
            socialId: profile.id,
            provider: "google",
          });
          await user.save();
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        done(null, { ...user._doc, token });
      } catch (err) {
        done(err);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            isVerified: true,
            socialId: profile.id,
            provider: "github",
          });
          await user.save();
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        done(null, { ...user._doc, token });
      } catch (err) {
        done(err);
      }
    }
  )
);

// // Facebook Strategy
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_CLIENT_ID,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//       callbackURL: "/api/auth/facebook/callback",
//       profileFields: ["id", "emails", "name"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ email: profile.emails[0].value });
//         if (!user) {
//           user = new User({
//             email: profile.emails[0].value,
//             isVerified: true,
//             socialId: profile.id,
//             provider: "facebook",
//           });
//           await user.save();
//         }
//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//           expiresIn: "1h",
//         });
//         done(null, { ...user._doc, token });
//       } catch (err) {
//         done(err);
//       }
//     }
//   )
// );

// // Apple Strategy
// passport.use(
//   new AppleStrategy(
//     {
//       clientID: process.env.APPLE_CLIENT_ID,
//       teamID: process.env.APPLE_TEAM_ID,
//       keyID: process.env.APPLE_KEY_ID,
//       privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//       callbackURL: "/api/auth/apple/callback",
//     },
//     async (accessToken, refreshToken, idToken, profile, done) => {
//       try {
//         let user = await User.findOne({ socialId: profile.id });
//         if (!user) {
//           user = new User({
//             email: idToken.email || `${profile.id}@apple.com`,
//             isVerified: true,
//             socialId: profile.id,
//             provider: "apple",
//           });
//           await user.save();
//         }
//         const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
//           expiresIn: "1h",
//         });
//         done(null, { ...user._doc, token });
//       } catch (err) {
//         done(err);
//       }
//     }
//   )
// );
