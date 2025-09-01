import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import fs from 'fs/promises';
import path from 'path';

export async function createMenuItem(req, res) {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(403).json({
        success: false,
        error: 'No restaurant found for this user',
      });
    }

    const menuItemData = {
      ...req.body,
      restaurant: restaurant._id,
      image: req.file ? `/uploads/menu-images/${req.file.filename}` : '',
    };

    const menuItem = await MenuItem.create(menuItemData);

    res.status(201).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create menu item',
    });
  }
}

export async function getMenuItems(req, res) {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(403).json({
        success: false,
        error: 'No restaurant found for this user',
      });
    }

    const menuItems = await MenuItem.find({
      restaurant: restaurant._id,
    }).select('name description price category image isAvailable');

    res.status(200).json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
    });
  }
}
export async function updateMenuItem(req, res) {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(403).json({
        success: false,
        error: 'No restaurant found for this user',
      });
    }

    const updateData = { ...req.body };
    if (req.file) {
      const oldMenuItem = await MenuItem.findById(id);
      if (oldMenuItem?.image) {
        const oldImagePath = path.join(process.cwd(), oldMenuItem.image);
        await fs.unlink(oldImagePath).catch(() => {});
      }
      updateData.image = `/uploads/menu-images/${req.file.filename}`;
    }

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: id, restaurant: restaurant._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update menu item',
    });
  }
}

export async function deleteMenuItem(req, res) {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(403).json({
        success: false,
        error: 'No restaurant found for this user',
      });
    }

    const menuItem = await MenuItem.findOneAndDelete({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
    }

    if (menuItem.image) {
      const imagePath = path.join(process.cwd(), menuItem.image);
      await fs.unlink(imagePath).catch(() => {});
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete menu item',
    });
  }
}

export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params; // Use 'id' instead of 'menuItemId'

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};
