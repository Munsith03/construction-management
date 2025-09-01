import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { verifyAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyAuth, getCart);
router.post('/:menuItemId', verifyAuth, addToCart);
router.patch('/:menuItemId', verifyAuth, removeFromCart);
router.delete('/:menuItemId', verifyAuth, clearCartItem);
router.delete('/', verifyAuth, clearCart); // <== Clear all cart items

export default router;
