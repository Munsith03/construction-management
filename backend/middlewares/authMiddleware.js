import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate({
      path: "roles",
      populate: { path: "permissions" },
    });
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const roleMiddleware = (roleName) => async (req, res, next) => {
  try {
    const hasRole = req.user.roles.some((role) => role.name === roleName);
    if (!hasRole) return res.status(403).json({ error: "Access denied" });
    next();
  } catch (error) {
    res.status(403).json({ error: "Access denied" });
  }
};

export const permissionMiddleware =
  (permissionName) => async (req, res, next) => {
    try {
      const hasPermission = req.user.roles.some((role) =>
        role.permissions.some((perm) => perm.name === permissionName)
      );
      if (!hasPermission)
        return res.status(403).json({ error: "Access denied" });
      next();
    } catch (error) {
      res.status(403).json({ error: "Access denied" });
    }
  };
