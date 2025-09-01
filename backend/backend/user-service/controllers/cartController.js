import User from '../models/User.js';
import axios from 'axios';

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware

    // Fetch user
    const user = await User.findById(userId).select('cart');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Enrich cart items with name and image
    const enrichedCart = await Promise.all(
      user.cart.map(async (item) => {
        try {
          const menuItemResponse = await axios.get(
            `${process.env.RESTAURANT_SERVICE_URL}/menu/${item.menuItem}`,
            {
              headers: { Authorization: req.headers.authorization },
            }
          );

          // Access the menu item object directly (not as an array)
          const menuItemDoc = menuItemResponse.data.data;

          if (!menuItemDoc) {
            throw new Error('Menu item not found in response');
          }

          return {
            menuItem: item.menuItem,
            quantity: item.quantity,
            price: item.price,
            restaurant: item.restaurant,
            name: menuItemDoc.name || 'Unknown Item',
            image: menuItemDoc.image || '',
          };
        } catch (error) {
          console.error(
            `Error fetching menu item ${item.menuItem}:`,
            error.message
          );
          return {
            ...item.toObject(),
            name: 'Unknown Item',
            image: '',
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedCart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart',
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { menuItemId } = req.params;
    const { quantity, price, restaurant } = req.body;

    const qty =
      isNaN(parseInt(quantity)) || parseInt(quantity) <= 0
        ? 1
        : parseInt(quantity);
    const itemPrice = parseFloat(price);

    if (!menuItemId || isNaN(itemPrice) || itemPrice <= 0 || !restaurant) {
      return res.status(400).json({
        success: false,
        error: 'Valid menu item ID, price, and restaurant are required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (
      user.cart.length > 0 &&
      user.cart[0].restaurant.toString() !== restaurant.toString()
    ) {
      return res.status(400).json({
        success: false,
        error: 'Cart can only contain items from one restaurant',
      });
    }

    const existingItemIndex = user.cart.findIndex(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (existingItemIndex >= 0) {
      user.cart[existingItemIndex].quantity += qty;
    } else {
      user.cart.push({
        menuItem: menuItemId,
        quantity: qty,
        price: itemPrice,
        restaurant,
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        cart: user.cart,
      },
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
    });
  }
};

// PATCH /cart/:menuItemId (to decrement quantity)
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { menuItemId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: 'Item not in cart' });
    }

    const currentItem = user.cart[itemIndex];

    if (currentItem.quantity > 1) {
      user.cart[itemIndex].quantity -= 1;
    } else {
      user.cart.splice(itemIndex, 1); // Remove item completely
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        cart: user.cart,
      },
    });
  } catch (error) {
    console.error('Error decrementing item in cart:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update cart' });
  }
};

export const clearCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { menuItemId } = req.params;

    if (!menuItemId) {
      return res.status(400).json({
        success: false,
        error: 'Menu item ID is required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const updatedCart = user.cart.filter(
      (item) => item.menuItem.toString() !== menuItemId
    );

    user.cart = updatedCart;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        cart: user.cart,
      },
    });
  } catch (error) {
    console.error('Error removing from cart:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart',
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: user.cart,
      },
    });
  } catch (error) {
    console.error('Error clearing cart:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart',
    });
  }
};
