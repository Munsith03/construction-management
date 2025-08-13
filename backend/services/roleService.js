import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import User from "../models/User.js";

export const createRole = async (name, permissionIds) => {
  const existingRole = await Role.findOne({ name });
  if (existingRole) throw new Error("Role already exists");

  const permissions = await Permission.find({ _id: { $in: permissionIds } });
  if (permissions.length !== permissionIds.length)
    throw new Error("Invalid permissions");

  const role = new Role({ name, permissions });
  await role.save();
  return role;
};

export const updateRole = async (roleId, name, permissionIds) => {
  const role = await Role.findById(roleId);
  if (!role) throw new Error("Role not found");

  if (name) role.name = name;
  if (permissionIds) {
    const permissions = await Permission.find({ _id: { $in: permissionIds } });
    if (permissions.length !== permissionIds.length)
      throw new Error("Invalid permissions");
    role.permissions = permissionIds;
  }

  await role.save();
  return role;
};

export const deleteRole = async (roleId) => {
  const role = await Role.findById(roleId);
  if (!role) throw new Error("Role not found");

  await User.updateMany({ roles: roleId }, { $pull: { roles: roleId } });
  await role.deleteOne();
};

export const createPermission = async (name, description) => {
  const existingPermission = await Permission.findOne({ name });
  if (existingPermission) throw new Error("Permission already exists");

  const permission = new Permission({ name, description });
  await permission.save();
  return permission;
};

export const assignRoleToUser = async (userId, roleId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const role = await Role.findById(roleId);
  if (!role) throw new Error("Role not found");

  if (!user.roles.includes(roleId)) {
    user.roles.push(roleId);
    await user.save();
  }
  return user;
};

export const removeRoleFromUser = async (userId, roleId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.roles = user.roles.filter(
    (role) => role.toString() !== roleId.toString()
  );
  await user.save();
  return user;
};
