const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validation = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Registrera ny användare
 * @access  Public
 */
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validation,
  async (req, res) => {
    // Implementation would go here
    res.json({ message: 'Register endpoint' });
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Logga in användare
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
  ],
  validation,
  async (req, res) => {
    // Implementation would go here
    res.json({ message: 'Login endpoint' });
  }
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Förnya access token
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
  // Implementation would go here
  res.json({ message: 'Refresh token endpoint' });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logga ut användare
 * @access  Private
 */
router.post('/logout', async (req, res) => {
  // Implementation would go here
  res.json({ message: 'Logout endpoint' });
});

module.exports = router;
