import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Middleware to verify authentication token and attach user
export const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Early return for missing or malformed authorization header
  if (!authHeader?.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Authentication required: No valid token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    // Verify user exists
    const user = await User.findById(decoded.id).select('-password -__v');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    const errorResponses = {
      JsonWebTokenError: {
        status: 401,
        message: 'Invalid authentication token',
      },
      TokenExpiredError: {
        status: 401,
        message: 'Authentication token expired',
      },
    };

    const response = errorResponses[error.name] || {
      status: 500,
      message: 'Internal server error during authentication',
    };

    return res.status(response.status).json({ message: response.message });
  }
};

// Middleware for role-based authorization
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is attached (in case middleware is used incorrectly)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Access denied: Insufficient permissions' });
    }

    next();
  };
};
