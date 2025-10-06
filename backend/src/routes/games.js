const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.use(auth);

/**
 * @route   POST /api/games
 * @desc    Skapa nytt spel
 * @access  Private
 */
router.post('/', async (req, res) => {
  res.json({ message: 'Create game endpoint' });
});

/**
 * @route   GET /api/games/:id
 * @desc    Hämta spel
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  res.json({ message: 'Get game endpoint' });
});

/**
 * @route   PUT /api/games/:id/round
 * @desc    Lägg till rond
 * @access  Private
 */
router.put('/:id/round', async (req, res) => {
  res.json({ message: 'Add round endpoint' });
});

/**
 * @route   PUT /api/games/:id/complete
 * @desc    Avsluta spel
 * @access  Private
 */
router.put('/:id/complete', async (req, res) => {
  res.json({ message: 'Complete game endpoint' });
});

module.exports = router;
