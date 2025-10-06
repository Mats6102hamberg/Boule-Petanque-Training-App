// API Configuration
export const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// App Configuration
export const APP_NAME = 'Boule Pétanque Training';
export const APP_VERSION = '1.0.0';

// Training Constants
export const EXERCISE_TYPES = {
  POINTING: 'pointing',
  SHOOTING: 'shooting',
  ROLLING: 'rolling',
  DISTANCE: 'distance',
};

export const EXERCISE_NAMES = {
  [EXERCISE_TYPES.POINTING]: 'Precision Pointing',
  [EXERCISE_TYPES.SHOOTING]: 'Shooting Practice',
  [EXERCISE_TYPES.ROLLING]: 'Rolling Technique',
  [EXERCISE_TYPES.DISTANCE]: 'Distance Control',
};

// Game Constants
export const GAME_TYPES = {
  SINGLES: 'singles',
  DOUBLES: 'doubles',
  TRIPLES: 'triples',
};

export const DEFAULT_TARGET_SCORE = 13;

// Boule Specifications (in meters)
export const BOULE_DIAMETER = 0.0755; // 75.5mm
export const COCHONNET_DIAMETER = 0.03; // 30mm

// Camera Settings
export const CAMERA_QUALITY = 'high';
export const VIDEO_MAX_DURATION = 30; // seconds

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES = {
  TRAINING: 'training',
  GAME: 'game',
  SOCIAL: 'social',
  MILESTONE: 'milestone',
};

// Rarity Levels
export const RARITY_LEVELS = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  SETTINGS: 'settings',
  OFFLINE_SESSIONS: 'offline_sessions',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  CHALLENGE: 'challenge',
  ACHIEVEMENT: 'achievement',
  FRIEND_REQUEST: 'friend_request',
  GAME_INVITE: 'game_invite',
};
