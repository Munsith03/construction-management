import express from 'express';
import {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} from '../controllers/materialController.js';

const router = express.Router();

// @route   POST /api/materials
// @desc    Create a new material
// @access  Public (add authentication middleware later if needed)
router.post('/', createMaterial);

// @route   GET /api/materials
// @desc    Get all materials with optional filtering and pagination
// @access  Public
router.get('/', getAllMaterials);

// @route   GET /api/materials/:id
// @desc    Get a single material by ID
// @access  Public
router.get('/:id', getMaterialById);

// @route   PUT /api/materials/:id
// @desc    Update a material by ID
// @access  Public
router.put('/:id', updateMaterial);

// @route   DELETE /api/materials/:id
// @desc    Delete a material by ID
// @access  Public
router.delete('/:id', deleteMaterial);

export default router;