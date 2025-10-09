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

router.post(
  "/roles",
  permissionMiddleware("createRole"),
  validateCreateRole,
  createRole
);
router.get("/roles", permissionMiddleware("getRoles"), getRoles);
router.put(
  "/roles/:id",
  permissionMiddleware("updateRole"),
  validateUpdateRole,
  updateRole
);
router.delete("/roles/:id", permissionMiddleware("deleteRole"), deleteRole);
router.post(
  "/permissions",
  permissionMiddleware("createPermission"),
  validatePermission,
  createPermission
);
router.get("/permissions", permissionMiddleware("createRole"), getPermissions);
router.delete(
  "/permissions/:id",
  permissionMiddleware("deletePermission"),
  deletePermission
);
router.post(
  "/users/:userId/roles",
  permissionMiddleware("assignRoleToUser"),
  validateAssignRole,
  assignRoleToUser
);
router.delete(
  "/users/:userId/roles/:roleId",
  permissionMiddleware("removeRoleFromUser"),
  validateAssignRole,
  removeRoleFromUser
);
router.get("/users", permissionMiddleware("getUsers"), getUsers);
router.delete("/users/:userId", permissionMiddleware("deleteUser"), deleteUser);

export default router;
