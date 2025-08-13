import {
  createRole as createRoleService,
  updateRole as updateRoleService,
  deleteRole as deleteRoleService,
  createPermission as createPermissionService,
  assignRoleToUser as assignRoleService,
  removeRoleFromUser as removeRoleService,
} from "../services/roleService.js";
import User from "../models/User.js";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";

export const createRole = async (req, res) => {
  try {
    const { name, permissionIds } = req.body;
    const role = await createRoleService(name, permissionIds);
    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissionIds } = req.body;
    const role = await updateRoleService(id, name, permissionIds);
    res.json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRoleService(id);
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createPermission = async (req, res) => {
  try {
    const { name, description } = req.body;
    const permission = await createPermissionService(name, description);
    res.status(201).json(permission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json(permissions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findByIdAndDelete(id);
    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }
    res.json({ message: "Permission deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate("permissions");
    res.json(roles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    const user = await assignRoleService(userId, roleId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeRoleFromUser = async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    const user = await removeRoleService(userId, roleId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("roles");
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
