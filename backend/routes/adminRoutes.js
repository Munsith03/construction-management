import express from "express";
import {
  createRole,
  updateRole,
  deleteRole,
  createPermission,
  deletePermission,
  assignRoleToUser,
  removeRoleFromUser,
  getUsers,
  deleteUser,
  getPermissions,
  getRoles,
} from "../controllers/adminController.js";
import {
  authMiddleware,
  roleMiddleware,
  permissionMiddleware,
} from "../middlewares/authMiddleware.js";
import {
  validateCreateRole,
  validateUpdateRole,
  validatePermission,
  validateAssignRole,
} from "../middlewares/validation.js";

const router = express.Router();

// Admin-only routes
router.use(authMiddleware);
router.use(roleMiddleware("Super Admin"));

router.post("/roles", validateCreateRole, createRole);
router.get("/roles", getRoles);
router.put("/roles/:id", validateUpdateRole, updateRole);
router.delete("/roles/:id", deleteRole);
router.post("/permissions", validatePermission, createPermission);
router.get("/permissions", getPermissions);
router.delete("/permissions/:id", deletePermission);
router.post("/users/:userId/roles", validateAssignRole, assignRoleToUser);
router.delete(
  "/users/:userId/roles/:roleId",
  validateAssignRole,
  removeRoleFromUser
);
router.get("/users", permissionMiddleware("viewUsers"), getUsers);
router.delete("/users/:userId", permissionMiddleware("deleteUser"), deleteUser);

export default router;
