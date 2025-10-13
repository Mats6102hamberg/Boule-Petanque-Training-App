const TrainingSession = require('../models/TrainingSession');
const throwAnalyzer = require('../services/ai/throwAnalyzer');
const distanceCalculator = require('../services/ai/distanceCalculator');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Skapa en ny träningssession
 */
exports.createSession = async (req, res) => {
  try {
    const { userId, exercises } = req.body;
    
    const session = new TrainingSession({
      userId,
      exercises,
      date: new Date(),
      statistics: {
        totalThrows: 0,
        successfulThrows: 0,
        averageDistance: 0,
        averageAccuracy: 0,
      },
    });
    
    await session.save();
    
    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Analysera ett kast med AI
 */
exports.analyzeThrow = async (req, res) => {
  try {
    const { sessionId, imageUrl, videoUrl } = req.body;
    
    // Analysera kastet med AI-modellen
    const analysis = await throwAnalyzer.analyze({
      imageUrl,
      videoUrl,
    });
    
    // Beräkna avstånd
    const distances = await distanceCalculator.calculate(imageUrl);
    
    // Uppdatera sessionen
    const session = await TrainingSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    session.exercises.push({
      type: analysis.technique,
      result: {
        accuracy: analysis.accuracy,
        distance: distances.toCochonnet,
        angle: analysis.angle,
        speed: analysis.speed,
      },
      timestamp: new Date(),
    });
    
    // Uppdatera statistik
    session.statistics.totalThrows += 1;
    if (analysis.accuracy > 70) {
      session.statistics.successfulThrows += 1;
    }
    
    await session.save();
    
    res.json({
      success: true,
      data: {
        analysis,
        distances,
        session,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Hämta alla träningssessioner för en användare
 */
exports.getUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, skip = 0 } = req.query;
    
    const sessions = await TrainingSession.find({ userId })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await TrainingSession.countDocuments({ userId });
    
    res.json({
      success: true,
      data: {
        sessions,
        total,
        hasMore: skip + sessions.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Hämta statistik för en användare
 */
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const sessions = await TrainingSession.find({ userId });
    
    // Beräkna aggregerad statistik
    const stats = {
      totalSessions: sessions.length,
      totalThrows: 0,
      successfulThrows: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      totalPracticeTime: 0,
      improvementRate: 0,
    };
    
    let totalAccuracy = 0;
    
    sessions.forEach((session) => {
      stats.totalThrows += session.statistics.totalThrows;
      stats.successfulThrows += session.statistics.successfulThrows;
      totalAccuracy += session.statistics.averageAccuracy;
      
      if (session.statistics.averageAccuracy > stats.bestAccuracy) {
        stats.bestAccuracy = session.statistics.averageAccuracy;
      }
    });
    
    if (sessions.length > 0) {
      stats.averageAccuracy = totalAccuracy / sessions.length;
    }
    
    // Beräkna förbättringstakt (jämför första och sista 5 sessionerna)
    if (sessions.length >= 10) {
      const firstFive = sessions.slice(-5);
      const lastFive = sessions.slice(0, 5);
      
      const firstAvg = firstFive.reduce((sum, s) => sum + s.statistics.averageAccuracy, 0) / 5;
      const lastAvg = lastFive.reduce((sum, s) => sum + s.statistics.averageAccuracy, 0) / 5;
      
      stats.improvementRate = ((lastAvg - firstAvg) / firstAvg) * 100;
    }
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Analysera bild från träning (ny endpoint för kamera-integration)
 */
exports.analyzeImage = async (req, res) => {
  try {
    const { trainingMode } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: 'No image provided',
      });
    }

    // Skicka bilden till AI/ML-tjänsten för analys
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imageFile.path));
    formData.append('mode', trainingMode || 'pointing');

    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, formData, {
        headers: formData.getHeaders(),
        timeout: 30000, // 30 sekunder timeout
      });

      const { distance, objects, confidence } = mlResponse.data;

      // Rensa upp uppladdad fil
      fs.unlinkSync(imageFile.path);

      res.json({
        success: true,
        distance: distance || Math.random() * 0.5, // Fallback till simulerat värde
        objects: objects || [],
        confidence: confidence || 0.85,
        analysis: {
          trainingMode,
          timestamp: new Date(),
        },
      });
    } catch (mlError) {
      console.error('ML Service error:', mlError.message);
      
      // Fallback: Returnera simulerade värden om ML-tjänsten inte är tillgänglig
      fs.unlinkSync(imageFile.path);
      
      res.json({
        success: true,
        distance: Math.random() * 0.5, // Simulerat avstånd 0-50cm
        objects: [
          { type: 'boule', confidence: 0.92 },
          { type: 'cochonnet', confidence: 0.88 },
        ],
        confidence: 0.85,
        analysis: {
          trainingMode,
          timestamp: new Date(),
          note: 'ML service unavailable - using simulated data',
        },
      });
    }
  } catch (error) {
    console.error('Analyze image error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Ta bort en träningssession
 */
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await TrainingSession.findByIdAndDelete(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
