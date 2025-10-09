import bcrypt from "bcrypt";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

// List of permissions
const permissionsList = [
  "createRole",
  "getRoles",
  "updateRole",
  "deleteRole",
  "deletePermission",
  "assignRoleToUser",
  "removeRoleFromUser",
  "getUsers",
  "deleteUser",
];

const seedSuperAdmin = async () => {
  try {
    // 1️⃣ Seed Permissions
    const permissions = [];
    for (const permName of permissionsList) {
      let perm = await Permission.findOne({ name: permName });
      if (!perm) {
        perm = await Permission.create({
          name: permName,
          description: `${permName} permission`,
        });
        console.log(`✅ Permission created: ${permName}`);
      }
      permissions.push(perm);
    }

    // 2️⃣ Seed Super Admin Role
    let superAdminRole = await Role.findOne({ name: "Super Admin" });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: "Super Admin",
        permissions: permissions.map((p) => p._id),
      });
      console.log("✅ Super Admin role created");
    } else {
      superAdminRole.permissions = Array.from(
        new Set([
          ...superAdminRole.permissions.map((p) => p.toString()),
          ...permissions.map((p) => p._id.toString()),
        ])
      );
      await superAdminRole.save();
      console.log("ℹ️ Super Admin role updated with missing permissions");
    }

    // 3️⃣ Seed Super Admin User
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    let user = await User.findOne({ email: adminEmail });
    if (!user) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      user = await User.create({
        email: adminEmail,
        password: hashedPassword,
        isVerified: true,
        roles: [superAdminRole._id],
      });
      console.log(`✅ Super admin user created: ${adminEmail}`);
    } else {
      const roleIds = user.roles.map((r) => r.toString());
      if (!roleIds.includes(superAdminRole._id.toString())) {
        user.roles.push(superAdminRole._id);
        await user.save();
        console.log(`ℹ️ Super admin user updated with Super Admin role`);
      } else {
        console.log(`ℹ️ Super admin user already exists`);
      }
    }

    console.log("✅ Seeding complete");
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  }
};

export default seedSuperAdmin;
