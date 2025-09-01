import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemById,
} from '../controllers/menuController.js';
import { verifyAuth, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/menu-images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png, gif) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Get single menu item by ID (path param)
router.get('/:id', getMenuItemById);

// Apply auth middlewares to all routes below
router.use(verifyAuth);
router.use(restrictTo('restaurant_admin'));

// Create menu item
router.post('/', upload.single('image'), createMenuItem);

// Get all menu items
router.get('/', getMenuItems);

// Update a menu item
router.patch('/:id', upload.single('image'), updateMenuItem);

// Delete a menu item
router.delete('/:id', deleteMenuItem);

export default router;
