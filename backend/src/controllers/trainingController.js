const TrainingSession = require('../models/TrainingSession');
const throwAnalyzer = require('../services/ai/throwAnalyzer');
const distanceCalculator = require('../services/ai/distanceCalculator');

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
