const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const validation = require('../middleware/validation');
const multer = require('multer');
const path = require('path');

// Konfigurera multer för filuppladdning
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `training-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

// Alla routes kräver autentisering (utom bildanalys för nu)
// router.use(auth);

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
 * @desc    Analysera bild från kamera (ny endpoint)
 * @access  Public (för utveckling)
 */
router.post(
  '/analyze',
  upload.single('image'),
  trainingController.analyzeImage
);

/**
 * @route   POST /api/training/analyze-throw
 * @desc    Analysera ett kast med AI (gammal endpoint)
 * @access  Private
 */
router.post(
  '/analyze-throw',
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
