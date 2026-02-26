// 🗄️ Local Storage Data Service (ersätter Firebase)
const STORAGE_KEYS = {
  USER: 'boule_user',
  SESSIONS: 'boule_sessions',
  ACHIEVEMENTS: 'boule_achievements',
  CHALLENGES: 'boule_challenges',
  STATS: 'boule_stats',
  GAMES: 'boule_games',
};

function getItem(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Default data
const DEFAULT_STATS = {
  accuracy: 0,
  totalThrows: 0,
  totalSessions: 0,
  wins: 0,
  streak: 0,
  lastTrainingDate: null,
  level: 1,
  points: 0,
  pointsToNextLevel: 500,
};

const DEFAULT_ACHIEVEMENTS = [
  { id: 'first_throw', name: 'Första Kastet', icon: '🎯', points: 10, unlocked: false, requirement: 'Gör ditt första kast' },
  { id: 'dedicated', name: 'Dedikerad Tränare', icon: '💪', points: 100, unlocked: false, requirement: '10 träningspass' },
  { id: 'first_win', name: 'Första Segern', icon: '🏆', points: 50, unlocked: false, requirement: 'Vinn ditt första spel' },
  { id: 'week_warrior', name: 'Veckokrigar', icon: '🔥', points: 150, unlocked: false, requirement: '7 dagars streak' },
  { id: 'champion', name: 'Champion', icon: '👑', points: 500, unlocked: false, requirement: 'Nå Level 10' },
  { id: 'precision_master', name: 'Precisionsmästare', icon: '🎖️', points: 1000, unlocked: false, requirement: '90% noggrannhet' },
  { id: 'century', name: '100 Kast', icon: '💯', points: 200, unlocked: false, requirement: 'Gör 100 kast totalt' },
  { id: 'sharpshooter', name: 'Prickskytt', icon: '🔫', points: 300, unlocked: false, requirement: '5 perfekta kast i rad' },
];

const generateDailyChallenges = () => {
  const today = new Date().toDateString();
  const saved = getItem(STORAGE_KEYS.CHALLENGES, null);
  if (saved && saved.date === today) return saved.challenges;

  const challenges = [
    { id: 'precision', title: 'Precision Master', icon: '🎯', description: 'Gör 10 kast med över 80% noggrannhet', reward: 50, target: 10, progress: 0 },
    { id: 'speed', title: 'Speed Demon', icon: '⚡', description: 'Slutför ett träningspass på under 15 min', reward: 30, target: 1, progress: 0 },
    { id: 'champion', title: 'Champion', icon: '🏆', description: 'Vinn 3 matcher idag', reward: 100, target: 3, progress: 0 },
  ];
  setItem(STORAGE_KEYS.CHALLENGES, { date: today, challenges });
  return challenges;
};

export const dataService = {
  // Stats
  getStats: () => getItem(STORAGE_KEYS.STATS, DEFAULT_STATS),
  saveStats: (stats) => setItem(STORAGE_KEYS.STATS, stats),

  // Sessions
  getSessions: () => getItem(STORAGE_KEYS.SESSIONS, []),
  addSession: (session) => {
    const sessions = getItem(STORAGE_KEYS.SESSIONS, []);
    sessions.unshift({ ...session, id: Date.now(), date: new Date().toISOString() });
    setItem(STORAGE_KEYS.SESSIONS, sessions);
    return sessions;
  },

  // Achievements
  getAchievements: () => {
    const saved = getItem(STORAGE_KEYS.ACHIEVEMENTS, null);
    if (saved) return saved;
    setItem(STORAGE_KEYS.ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS);
    return DEFAULT_ACHIEVEMENTS;
  },
  saveAchievements: (achievements) => setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements),

  // Challenges
  getDailyChallenges: generateDailyChallenges,
  saveChallenges: (challenges) => {
    const today = new Date().toDateString();
    setItem(STORAGE_KEYS.CHALLENGES, { date: today, challenges });
  },

  // Games
  getGames: () => getItem(STORAGE_KEYS.GAMES, []),
  addGame: (game) => {
    const games = getItem(STORAGE_KEYS.GAMES, []);
    games.unshift({ ...game, id: Date.now(), date: new Date().toISOString() });
    setItem(STORAGE_KEYS.GAMES, games);
    return games;
  },

  // Reset
  resetAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};
