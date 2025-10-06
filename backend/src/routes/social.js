const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.use(auth);

/**
 * @route   GET /api/social/friends
 * @desc    Hämta vänlista
 * @access  Private
 */
router.get('/friends', async (req, res) => {
  res.json({ message: 'Get friends endpoint' });
});

/**
 * @route   POST /api/social/friends/:userId
 * @desc    Lägg till vän
 * @access  Private
 */
router.post('/friends/:userId', async (req, res) => {
  res.json({ message: 'Add friend endpoint' });
});

/**
 * @route   POST /api/social/challenge
 * @desc    Utmana vän
 * @access  Private
 */
router.post('/challenge', async (req, res) => {
  res.json({ message: 'Challenge friend endpoint' });
});

/**
 * @route   GET /api/social/leaderboard
 * @desc    Hämta leaderboard
 * @access  Private
 */
router.get('/leaderboard', async (req, res) => {
  res.json({ message: 'Get leaderboard endpoint' });
});

module.exports = router;
