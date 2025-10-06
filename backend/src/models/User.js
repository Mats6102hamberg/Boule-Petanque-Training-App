const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    location: String,
  },
  stats: {
    accuracy: {
      type: Number,
      default: 0,
    },
    sessionsCompleted: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    totalThrows: {
      type: Number,
      default: 0,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    gamesWon: {
      type: Number,
      default: 0,
    },
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  settings: {
    notifications: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: 'sv',
    },
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
});

// Indexera för snabbare sökningar
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'stats.accuracy': -1 });

// Virtuella fält
userSchema.virtual('winRate').get(function() {
  if (this.stats.gamesPlayed === 0) return 0;
  return (this.stats.gamesWon / this.stats.gamesPlayed) * 100;
});

// Metoder
userSchema.methods.updateStats = function(sessionData) {
  this.stats.sessionsCompleted += 1;
  this.stats.totalThrows += sessionData.totalThrows;
  
  // Uppdatera genomsnittlig accuracy
  const totalAccuracy = this.stats.accuracy * (this.stats.sessionsCompleted - 1);
  this.stats.accuracy = (totalAccuracy + sessionData.averageAccuracy) / this.stats.sessionsCompleted;
  
  if (sessionData.score > this.stats.bestScore) {
    this.stats.bestScore = sessionData.score;
  }
  
  this.lastActive = Date.now();
};

module.exports = mongoose.model('User', userSchema);
