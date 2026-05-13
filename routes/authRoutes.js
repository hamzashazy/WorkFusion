const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const { 
  validateRequired, 
  validateEmail, 
  validatePassword 
} = require('../middleware/validationMiddleware');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', 
  validateRequired(['name', 'email', 'password', 'role']),
  validateEmail,
  validatePassword,
  authController.register
);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', 
  validateRequired(['email', 'password']),
  validateEmail,
  authController.login
);

// @route   GET api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, authController.getProfile);

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, authController.updateProfile);

// @route   PUT api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', auth, authController.changePassword);

module.exports = router;

