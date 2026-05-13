const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoriesGrouped,
  getCategoryById,
  getParentCategories,
  getSubcategories,
  searchCategories
} = require('../controllers/categoryController');

// @route   GET /api/categories
// @desc    Get all categories with children
// @access  Public
router.get('/', getAllCategories);

// @route   GET /api/categories/grouped
// @desc    Get categories grouped by work mode (offline/online/hybrid)
// @access  Public
router.get('/grouped', getCategoriesGrouped);

// @route   GET /api/categories/parents
// @desc    Get only parent categories (for main dropdown)
// @access  Public
router.get('/parents', getParentCategories);

// @route   GET /api/categories/search
// @desc    Search categories by name
// @access  Public
router.get('/search', searchCategories);

// @route   GET /api/categories/:parentId/subcategories
// @desc    Get subcategories of a parent category (before /:id so paths are not captured as ids)
// @access  Public
router.get('/:parentId/subcategories', getSubcategories);

// @route   GET /api/categories/:id
// @desc    Get single category by ID or slug
// @access  Public
router.get('/:id', getCategoryById);

module.exports = router;
