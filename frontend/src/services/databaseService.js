// 🗄️ Database Service - Firestore
import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';

// 👤 USERS
export const createUser = async (userId, userData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: serverTimestamp()
    });
    console.log('✅ User created in database');
    return { success: true };
  } catch (error) {
    // Om dokumentet inte finns, skapa det
    try {
      await addDoc(collection(db, 'users'), {
        uid: userId,
        ...userData,
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (err) {
      console.error('❌ Create user error:', err.message);
      return { success: false, error: err.message };
    }
  }
};

export const getUser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('❌ Get user error:', error.message);
    return { success: false, error: error.message };
  }
};

// 🏋️ TRAINING SESSIONS
export const saveTrainingSession = async (sessionData) => {
  try {
    const docRef = await addDoc(collection(db, 'trainingSessions'), {
      ...sessionData,
      createdAt: serverTimestamp()
    });
    console.log('✅ Training session saved:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Save session error:', error.message);
    return { success: false, error: error.message };
  }
};

export const getUserTrainingSessions = async (userId) => {
  try {
    const q = query(
      collection(db, 'trainingSessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    const sessions = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: sessions };
  } catch (error) {
    console.error('❌ Get sessions error:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateTrainingSession = async (sessionId, updates) => {
  try {
    await updateDoc(doc(db, 'trainingSessions', sessionId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Session updated');
    return { success: true };
  } catch (error) {
    console.error('❌ Update session error:', error.message);
    return { success: false, error: error.message };
  }
};

// 🎮 GAMES
export const createGame = async (gameData) => {
  try {
    const docRef = await addDoc(collection(db, 'games'), {
      ...gameData,
      status: 'active',
      createdAt: serverTimestamp()
    });
    console.log('✅ Game created:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Create game error:', error.message);
    return { success: false, error: error.message };
  }
};

export const updateGame = async (gameId, updates) => {
  try {
    await updateDoc(doc(db, 'games', gameId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Update game error:', error.message);
    return { success: false, error: error.message };
  }
};

export const getGame = async (gameId) => {
  try {
    const gameDoc = await getDoc(doc(db, 'games', gameId));
    if (gameDoc.exists()) {
      return { success: true, data: { id: gameDoc.id, ...gameDoc.data() } };
    }
    return { success: false, error: 'Game not found' };
  } catch (error) {
    console.error('❌ Get game error:', error.message);
    return { success: false, error: error.message };
  }
};

// 📊 STATISTICS
export const getUserStats = async (userId) => {
  try {
    // Hämta träningssessions
    const sessionsQuery = query(
      collection(db, 'trainingSessions'),
      where('userId', '==', userId)
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);

    // Hämta games
    const gamesQuery = query(
      collection(db, 'games'),
      where('players', 'array-contains', userId)
    );
    const gamesSnapshot = await getDocs(gamesQuery);

    const stats = {
      totalSessions: sessionsSnapshot.size,
      totalGames: gamesSnapshot.size,
      totalWins: 0,
      averageScore: 0
    };

    // Beräkna wins
    gamesSnapshot.forEach((doc) => {
      const game = doc.data();
      if (game.winner === userId) {
        stats.totalWins++;
      }
    });

    return { success: true, data: stats };
  } catch (error) {
    console.error('❌ Get stats error:', error.message);
    return { success: false, error: error.message };
  }
};

// 🏆 ACHIEVEMENTS
export const getUserAchievements = async (userId) => {
  try {
    const q = query(
      collection(db, 'achievements'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const achievements = [];
    querySnapshot.forEach((doc) => {
      achievements.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: achievements };
  } catch (error) {
    console.error('❌ Get achievements error:', error.message);
    return { success: false, error: error.message };
  }
};

export const unlockAchievement = async (userId, achievementId) => {
  try {
    await addDoc(collection(db, 'achievements'), {
      userId,
      achievementId,
      unlockedAt: serverTimestamp()
    });
    console.log('✅ Achievement unlocked:', achievementId);
    return { success: true };
  } catch (error) {
    console.error('❌ Unlock achievement error:', error.message);
    return { success: false, error: error.message };
  }
};

export default {
  // Users
  createUser,
  getUser,
  // Training
  saveTrainingSession,
  getUserTrainingSessions,
  updateTrainingSession,
  // Games
  createGame,
  updateGame,
  getGame,
  // Stats
  getUserStats,
  // Achievements
  getUserAchievements,
  unlockAchievement
};
