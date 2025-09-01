import User from '../models/User.js';

export const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }
    res.json(user);
  } catch (err) {
    console.error(`[SERVER_ERROR] ${err.message}`);
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch user profile',
      code: 'SERVER_ERROR',
    });
  }
};

//Added by Bavi for need in the Order Service
export const getUserByparam = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }
    res.json(user);
  } catch (err) {
    console.error(`[SERVER_ERROR] ${err.message}`);
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch user profile',
      code: 'SERVER_ERROR',
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (
      ![
        'customer',
        'restaurant_admin',
        'delivery_personnel',
        'system_admin',
      ].includes(role)
    ) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (err) {
    console.error(`[SERVER_ERROR] ${err.message}`);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

export const updateUserDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phone, address } = req.body;

    // Validate input
    if (!name && !email && !phone && !address) {
      return res.status(400).json({
        status: 400,
        message: 'At least one field must be provided for update',
        code: 'INVALID_INPUT',
      });
    }

    // Prepare update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;

    const user = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      status: 200,
      message: 'User details updated successfully',
      data: user,
    });
  } catch (err) {
    console.error(`[SERVER_ERROR] ${err.message}`);
    res.status(500).json({
      status: 500,
      message: 'Failed to update user details',
      code: 'SERVER_ERROR',
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      status: 200,
      message: 'User deleted successfully',
    });
  } catch (err) {
    console.error(`[SERVER_ERROR] ${err.message}`);
    res.status(500).json({
      status: 500,
      message: 'Failed to delete user',
      code: 'SERVER_ERROR',
    });
  }
};
