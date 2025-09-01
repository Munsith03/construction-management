import express from 'express';
import {
  createRestaurant,
  getUnavailableRestaurants,
  updateRestaurantAvailability,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getMenuItemsByRestaurant,
  getRestaurantByOwner
} from '../controllers/restaurantController.js';
import { verifyAuth, restrictTo } from '../middlewares/authMiddleware.js';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `restaurant-${Date.now()}.${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const router = express.Router();

// Restaurant routes
router.post(
  '/',
  verifyAuth,
  restrictTo('customer', 'restaurant_admin'),
  upload.single('image'), // Handle single image upload
  createRestaurant
);

router.get(
  '/unavailable',
  verifyAuth,
  restrictTo('system_admin'),
  getUnavailableRestaurants
);

router.patch(
  '/:id/availability',
  verifyAuth,
  restrictTo('system_admin'),
  updateRestaurantAvailability
);

// Fetch menu items for a specific restaurant
router.get('/menu', getMenuItemsByRestaurant);

router.get(
  '/owner',
  verifyAuth,
  restrictTo('restaurant_admin'),
  getRestaurantByOwner
);
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.put('/:id', updateRestaurant);
router.delete('/:id', deleteRestaurant);

export default router;
