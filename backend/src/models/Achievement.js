const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  icon: String,
  category: {
    type: String,
    enum: ['training', 'game', 'social', 'milestone'],
    required: true,
  },
  criteria: {
    type: {
      type: String,
      enum: ['count', 'threshold', 'streak', 'special'],
      required: true,
    },
    metric: String, // t.ex. 'sessionsCompleted', 'accuracy', 'gamesWon'
    target: Number,
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common',
  },
  points: {
    type: Number,
    default: 10,
  },
  unlockedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexera
achievementSchema.index({ category: 1, rarity: 1 });
achievementSchema.index({ 'unlockedBy.userId': 1 });

// Statiska metoder
achievementSchema.statics.checkAchievements = async function(userId, userStats) {
  const achievements = await this.find({});
  const unlockedAchievements = [];
  
  for (const achievement of achievements) {
    // Kolla om användaren redan har detta achievement
    const alreadyUnlocked = achievement.unlockedBy.some(
      unlock => unlock.userId.toString() === userId.toString()
    );
    
    if (alreadyUnlocked) continue;
    
    // Kolla om kriterierna är uppfyllda
    const unlocked = checkCriteria(achievement.criteria, userStats);
    
    if (unlocked) {
      achievement.unlockedBy.push({
        userId,
        unlockedAt: new Date(),
      });
      await achievement.save();
      unlockedAchievements.push(achievement);
    }
  }
  
  return unlockedAchievements;
};

function checkCriteria(criteria, stats) {
  const { type, metric, target } = criteria;
  
  switch (type) {
    case 'count':
      return stats[metric] >= target;
    
    case 'threshold':
      return stats[metric] >= target;
    
    case 'streak':
      // Implementera streak-logik
      return false;
    
    case 'special':
      // Implementera special-logik
      return false;
    
    default:
      return false;
  }
}

module.exports = mongoose.model('Achievement', achievementSchema);
