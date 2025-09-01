import express from 'express';
import { verifyAuth, restrictTo } from '../middlewares/authMiddleware.js';
import {
  userProfile,
  getUserByparam,
  updateUserDetails,
  deleteUser,
  updateUserRole,
} from '../controllers/userControllers.js';

const router = express.Router();

router.patch(
  '/:id/role',
  verifyAuth,
  restrictTo('system_admin'),
  updateUserRole
);

// Added by Bavi for need in the Order Service
router.get('/:id', getUserByparam);

// Update user details (protected route)
router.patch('/update', verifyAuth, updateUserDetails);

// Delete user (protected route)
router.delete('/delete', verifyAuth, deleteUser);

//user profile route
router.get('/profile', verifyAuth, userProfile);

export default router;
