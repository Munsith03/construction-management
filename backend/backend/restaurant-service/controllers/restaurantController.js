import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant.js';
import MenuItem from '../models/MenuItem.js';

// Create new restaurant
export async function createRestaurant(req, res) {
  try {
    let restaurantData = {
      ...req.body,
      owner: req.user._id,
    };

    // Handle phone number formatting
    if (req.body.phoneNumber) {
      restaurantData.phoneNumber = req.body.phoneNumber.replace(/\s/g, '');
    }

    // Handle image upload
    if (req.file) {
      restaurantData.image = `/uploads/${req.file.filename}`;
    }

    const restaurant = await Restaurant.create(restaurantData);

    res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create restaurant',
    });
  }
}

// Get all unavailable restaurants
export async function getUnavailableRestaurants(req, res) {
  try {
    const restaurants = await Restaurant.find({ isAvailable: false }).select(
      'storeName brandName streetAddress city state zipcode countryCode phoneNumber businessType isAvailable'
    );

    res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    console.error('Error fetching unavailable restaurants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unavailable restaurants',
    });
  }
}

// Update restaurant availability
export async function updateRestaurantAvailability(req, res) {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isAvailable must be a boolean value',
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
    }

    // Update user role to restaurant_admin via User service
    const userId = req.user?.id; // From verifyAuth middleware
    if (userId) {
      try {
        await axios.patch(
          `${USER_SERVICE_URL}/${userId}/role`,
          { role: 'restaurant_admin' },
          {
            headers: {
              Authorization: `Bearer ${SERVICE_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (err) {
        console.error(
          `[USER_SERVICE_ERROR] Failed to update user role: ${err.message}`
        );
        // Log error but don't fail the request; role update is secondary
      }
    } else {
      console.warn('[USER_SERVICE_WARN] No user ID found in request');
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error updating restaurant availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update restaurant availability',
    });
  }
}

// Get all restaurants
export async function getAllRestaurants(req, res) {
  try {
    const restaurants = await Restaurant.find().populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
    });
  }
}

// Get single restaurant by ID
export async function getRestaurantById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid restaurant ID',
      });
    }

    const restaurant = await Restaurant.findById(req.params.id).populate(
      'owner',
      'name email'
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
    });
  }
}

// Update restaurant
export async function updateRestaurant(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid restaurant ID',
      });
    }

    // Validate and format phone number
    let updateData = { ...req.body };
    if (req.body.phoneNumber) {
      if (!req.body.countryCode) {
        return res.status(400).json({
          success: false,
          error: 'Country code is required when providing a phone number',
        });
      }
      if (!req.body.phoneNumber.startsWith('+')) {
        updateData.phoneNumber =
          `${req.body.countryCode}${req.body.phoneNumber}`.replace(/\s/g, '');
      }
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors)
          .map((err) => err.message)
          .join(', '),
      });
    }
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
    });
  }
}

// Delete restaurant
export async function deleteRestaurant(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid restaurant ID',
      });
    }

    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred',
    });
  }
}

export const getMenuItemsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID is required',
      });
    }

    // Validate restaurant existence
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
    }

    // Fetch menu items for the restaurant
    const menuItems = await MenuItem.find({
      restaurant: restaurantId,
      isAvailable: true,
    }).select('_id name description price category image isAvailable');

    res.status(200).json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch menu items',
    });
  }
};


export const getRestaurantByOwner = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Error fetching restaurant by owner:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant',
    });
  }
};