const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pointing', 'shooting', 'rolling', 'distance'],
    required: true,
  },
  result: {
    accuracy: Number,
    distance: Number,
    angle: Number,
    speed: Number,
    success: Boolean,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const trainingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number, // i sekunder
    default: 0,
  },
  exercises: [exerciseSchema],
  statistics: {
    totalThrows: {
      type: Number,
      default: 0,
    },
    successfulThrows: {
      type: Number,
      default: 0,
    },
    averageDistance: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
    },
    bestThrow: {
      accuracy: Number,
      distance: Number,
    },
  },
  videoUrl: String,
  notes: String,
  weather: {
    temperature: Number,
    conditions: String,
    wind: String,
  },
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
});

// Indexera för snabbare queries
trainingSessionSchema.index({ userId: 1, date: -1 });
trainingSessionSchema.index({ date: -1 });

// Beräkna statistik automatiskt
trainingSessionSchema.pre('save', function(next) {
  if (this.exercises.length > 0) {
    let totalDistance = 0;
    let totalAccuracy = 0;
    let successCount = 0;
    let bestAccuracy = 0;
    let bestDistance = Infinity;
    
    this.exercises.forEach((exercise) => {
      if (exercise.result) {
        totalDistance += exercise.result.distance || 0;
        totalAccuracy += exercise.result.accuracy || 0;
        
        if (exercise.result.success) {
          successCount++;
        }
        
        if (exercise.result.accuracy > bestAccuracy) {
          bestAccuracy = exercise.result.accuracy;
          bestDistance = exercise.result.distance;
        }
      }
    });
    
    this.statistics.totalThrows = this.exercises.length;
    this.statistics.successfulThrows = successCount;
    this.statistics.averageDistance = totalDistance / this.exercises.length;
    this.statistics.averageAccuracy = totalAccuracy / this.exercises.length;
    this.statistics.bestThrow = {
      accuracy: bestAccuracy,
      distance: bestDistance,
    };
  }
  
  next();
});

module.exports = mongoose.model('TrainingSession', trainingSessionSchema);
