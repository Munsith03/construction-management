import Staff from "../models/Staff.js";
import User from "../models/User.js";

export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ name: 1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if staff with email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res
        .status(400)
        .json({ error: "Staff with this email already exists" });
    }

    // Create staff member
    const staff = new Staff(req.body);
    await staff.save();

    res.status(201).json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if email is being changed and already exists
    if (req.body.email) {
      const existingStaff = await Staff.findOne({
        email: req.body.email,
        _id: { $ne: id },
      });

      if (existingStaff) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    const staff = await Staff.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!staff) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    res.json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    res.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const linkStaffToUser = async (req, res) => {
  try {
    const { staffId, userId } = req.body;

    // Validate both IDs exist
    const staff = await Staff.findById(staffId);
    const user = await User.findById(userId);

    if (!staff) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update staff with user ID
    staff.userId = userId;
    await staff.save();

    res.json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Utility endpoint for tasks assignees dropdown
export const getStaffForAssignees = async (req, res) => {
  try {
    const staff = await Staff.find({ isActive: true })
      .select("name email position department _id")
      .sort({ name: 1 });

    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
