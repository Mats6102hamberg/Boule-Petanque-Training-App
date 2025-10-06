const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validation = require('../middleware/validation');

// Alla routes kräver autentisering
router.use(auth);

/**
 * @route   POST /api/training/sessions
 * @desc    Skapa ny träningssession
 * @access  Private
 */
router.post(
  '/sessions',
  [
    body('exercises').isArray(),
  ],
  validation,
  trainingController.createSession
);

/**
 * @route   POST /api/training/analyze
 * @desc    Analysera ett kast med AI
 * @access  Private
 */
router.post(
  '/analyze',
  [
    body('sessionId').isMongoId(),
    body('imageUrl').optional().isURL(),
    body('videoUrl').optional().isURL(),
  ],
  validation,
  trainingController.analyzeThrow
);

/**
 * @route   GET /api/training/sessions
 * @desc    Hämta användarens träningssessioner
 * @access  Private
 */
router.get(
  '/sessions',
  trainingController.getUserSessions
);

/**
 * @route   GET /api/training/stats
 * @desc    Hämta träningsstatistik
 * @access  Private
 */
router.get(
  '/stats',
  trainingController.getUserStats
);

/**
 * @route   DELETE /api/training/sessions/:sessionId
 * @desc    Ta bort träningssession
 * @access  Private
 */
router.delete(
  '/sessions/:sessionId',
  trainingController.deleteSession
);

module.exports = router;
