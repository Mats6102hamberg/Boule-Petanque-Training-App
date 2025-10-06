const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
  },
  scores: {
    type: Map,
    of: Number,
  },
  throws: [{
    playerId: mongoose.Schema.Types.ObjectId,
    teamId: String,
    distance: Number,
    accuracy: Number,
    timestamp: Date,
  }],
  winner: String,
  duration: Number, // sekunder
});

const gameSchema = new mongoose.Schema({
  teams: [{
    id: String,
    name: String,
    players: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    color: String,
  }],
  rounds: [roundSchema],
  currentRound: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed', 'cancelled'],
    default: 'waiting',
  },
  gameType: {
    type: String,
    enum: ['singles', 'doubles', 'triples'],
    required: true,
  },
  targetScore: {
    type: Number,
    default: 13,
  },
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  weather: {
    temperature: Number,
    conditions: String,
    wind: String,
  },
  startedAt: Date,
  completedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexera för snabbare queries
gameSchema.index({ status: 1, createdAt: -1 });
gameSchema.index({ 'teams.players': 1 });

// Virtuella fält
gameSchema.virtual('duration').get(function() {
  if (this.startedAt && this.completedAt) {
    return Math.floor((this.completedAt - this.startedAt) / 1000);
  }
  return 0;
});

gameSchema.virtual('winner').get(function() {
  if (this.status !== 'completed') return null;
  
  const scores = {};
  this.teams.forEach(team => {
    scores[team.id] = 0;
  });
  
  this.rounds.forEach(round => {
    round.scores.forEach((score, teamId) => {
      scores[teamId] = (scores[teamId] || 0) + score;
    });
  });
  
  let maxScore = 0;
  let winningTeam = null;
  
  Object.entries(scores).forEach(([teamId, score]) => {
    if (score > maxScore) {
      maxScore = score;
      winningTeam = teamId;
    }
  });
  
  return winningTeam;
});

// Metoder
gameSchema.methods.addRound = function(roundData) {
  this.rounds.push({
    roundNumber: this.rounds.length + 1,
    ...roundData,
  });
  this.currentRound = this.rounds.length;
};

gameSchema.methods.completeGame = function() {
  this.status = 'completed';
  this.completedAt = new Date();
};

gameSchema.methods.getScore = function(teamId) {
  return this.rounds.reduce((total, round) => {
    return total + (round.scores.get(teamId) || 0);
  }, 0);
};

module.exports = mongoose.model('Game', gameSchema);
