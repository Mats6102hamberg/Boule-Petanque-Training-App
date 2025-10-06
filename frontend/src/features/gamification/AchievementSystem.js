import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Animated } from 'react-native';
import { colors } from '../../styles/colors';
import { onAchievementUnlocked, onLevelUp } from '../../utils/hapticFeedback';

/**
 * Achievement System
 * 
 * Gamification: Achievements och level-system
 */

const ACHIEVEMENTS = [
  // Beginner Achievements
  {
    id: 'first_throw',
    title: 'Första Kastet',
    description: 'Gör ditt första kast',
    icon: '🎯',
    rarity: 'common',
    points: 10,
    category: 'beginner',
  },
  {
    id: 'first_session',
    title: 'Första Passet',
    description: 'Slutför ditt första träningspass',
    icon: '🏋️',
    rarity: 'common',
    points: 25,
    category: 'beginner',
  },
  {
    id: 'calibration_master',
    title: 'Kalibreringsmästare',
    description: 'Kalibrera kameran',
    icon: '📐',
    rarity: 'common',
    points: 15,
    category: 'beginner',
  },

  // Training Achievements
  {
    id: 'dedicated_trainer',
    title: 'Dedikerad Tränare',
    description: 'Slutför 50 träningspass',
    icon: '💪',
    rarity: 'rare',
    points: 100,
    category: 'training',
  },
  {
    id: 'sharpshooter',
    title: 'Prickskytt',
    description: 'Uppnå 90% noggrannhet i ett pass',
    icon: '🎯',
    rarity: 'epic',
    points: 150,
    category: 'training',
  },
  {
    id: 'marathon_trainer',
    title: 'Maratonträning',
    description: 'Träna i 2 timmar utan paus',
    icon: '⏱️',
    rarity: 'epic',
    points: 200,
    category: 'training',
  },

  // Game Achievements
  {
    id: 'first_win',
    title: 'Första Segern',
    description: 'Vinn ditt första spel',
    icon: '🏆',
    rarity: 'common',
    points: 50,
    category: 'game',
  },
  {
    id: 'champion',
    title: 'Champion',
    description: 'Vinn 100 matcher',
    icon: '👑',
    rarity: 'legendary',
    points: 500,
    category: 'game',
  },
  {
    id: 'perfect_game',
    title: 'Perfekt Match',
    description: 'Vinn 13-0',
    icon: '💯',
    rarity: 'epic',
    points: 250,
    category: 'game',
  },

  // Social Achievements
  {
    id: 'social_butterfly',
    title: 'Social Fjäril',
    description: 'Lägg till 10 vänner',
    icon: '🦋',
    rarity: 'rare',
    points: 75,
    category: 'social',
  },
  {
    id: 'challenger',
    title: 'Utmanare',
    description: 'Utmana 25 spelare',
    icon: '⚔️',
    rarity: 'rare',
    points: 100,
    category: 'social',
  },

  // Skill Achievements
  {
    id: 'precision_master',
    title: 'Precisionsmästare',
    description: 'Få en boule inom 1cm från cochonnet',
    icon: '🎖️',
    rarity: 'legendary',
    points: 1000,
    category: 'skill',
  },
  {
    id: 'technique_expert',
    title: 'Teknikexpert',
    description: 'Bemästra alla tre tekniker',
    icon: '🥋',
    rarity: 'epic',
    points: 300,
    category: 'skill',
  },

  // Streak Achievements
  {
    id: 'week_warrior',
    title: 'Veckokrigar',
    description: 'Träna 7 dagar i rad',
    icon: '🔥',
    rarity: 'rare',
    points: 150,
    category: 'streak',
  },
  {
    id: 'month_master',
    title: 'Månadsmästare',
    description: 'Träna 30 dagar i rad',
    icon: '🔥🔥',
    rarity: 'legendary',
    points: 1000,
    category: 'streak',
  },
];

const AchievementSystem = ({ userStats }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [currentUnlock, setCurrentUnlock] = useState(null);
  const [level, setLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    checkAchievements();
  }, [userStats]);

  const checkAchievements = () => {
    // Kontrollera vilka achievements som ska låsas upp
    ACHIEVEMENTS.forEach(achievement => {
      if (!isUnlocked(achievement.id) && shouldUnlock(achievement)) {
        unlockAchievement(achievement);
      }
    });
  };

  const shouldUnlock = (achievement) => {
    // Logik för att avgöra om achievement ska låsas upp
    // Baserat på userStats
    switch (achievement.id) {
      case 'first_throw':
        return userStats?.totalThrows > 0;
      case 'first_session':
        return userStats?.sessionsCompleted > 0;
      case 'dedicated_trainer':
        return userStats?.sessionsCompleted >= 50;
      case 'sharpshooter':
        return userStats?.bestAccuracy >= 90;
      case 'first_win':
        return userStats?.gamesWon > 0;
      case 'champion':
        return userStats?.gamesWon >= 100;
      case 'week_warrior':
        return userStats?.currentStreak >= 7;
      case 'month_master':
        return userStats?.currentStreak >= 30;
      default:
        return false;
    }
  };

  const isUnlocked = (achievementId) => {
    return unlockedAchievements.some(a => a.id === achievementId);
  };

  const unlockAchievement = (achievement) => {
    setUnlockedAchievements(prev => [...prev, achievement]);
    setTotalPoints(prev => prev + achievement.points);
    setCurrentUnlock(achievement);
    setShowUnlockModal(true);
    
    // Haptic feedback
    onAchievementUnlocked();
    
    // Animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        delay: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowUnlockModal(false);
    });

    // Check level up
    checkLevelUp();
  };

  const checkLevelUp = () => {
    const newLevel = Math.floor(totalPoints / 1000) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      onLevelUp();
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return '#9E9E9E';
      case 'rare':
        return '#2196F3';
      case 'epic':
        return '#9C27B0';
      case 'legendary':
        return '#FF9800';
      default:
        return colors.textSecondary;
    }
  };

  const getProgressToNextLevel = () => {
    const pointsInCurrentLevel = totalPoints % 1000;
    return (pointsInCurrentLevel / 1000) * 100;
  };

  const groupByCategory = () => {
    const grouped = {};
    ACHIEVEMENTS.forEach(achievement => {
      if (!grouped[achievement.category]) {
        grouped[achievement.category] = [];
      }
      grouped[achievement.category].push(achievement);
    });
    return grouped;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'beginner':
        return '🌱';
      case 'training':
        return '💪';
      case 'game':
        return '🏆';
      case 'social':
        return '👥';
      case 'skill':
        return '⭐';
      case 'streak':
        return '🔥';
      default:
        return '🎯';
    }
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'beginner':
        return 'Nybörjare';
      case 'training':
        return 'Träning';
      case 'game':
        return 'Spel';
      case 'social':
        return 'Socialt';
      case 'skill':
        return 'Färdighet';
      case 'streak':
        return 'Streak';
      default:
        return category;
    }
  };

  const groupedAchievements = groupByCategory();

  return (
    <View style={styles.container}>
      {/* Level & Progress */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <Text style={styles.levelIcon}>⭐</Text>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Level {level}</Text>
            <Text style={styles.levelPoints}>{totalPoints} poäng</Text>
          </View>
        </View>
        
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${getProgressToNextLevel()}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {1000 - (totalPoints % 1000)} poäng till Level {level + 1}
        </Text>
      </View>

      {/* Achievements */}
      <ScrollView style={styles.achievementsList}>
        {Object.entries(groupedAchievements).map(([category, achievements]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
              <Text style={styles.categoryTitle}>{getCategoryTitle(category)}</Text>
              <Text style={styles.categoryCount}>
                {achievements.filter(a => isUnlocked(a.id)).length}/{achievements.length}
              </Text>
            </View>

            {achievements.map(achievement => {
              const unlocked = isUnlocked(achievement.id);
              return (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    !unlocked && styles.achievementCardLocked,
                  ]}
                >
                  <Text style={[
                    styles.achievementIcon,
                    !unlocked && styles.achievementIconLocked,
                  ]}>
                    {achievement.icon}
                  </Text>
                  
                  <View style={styles.achievementInfo}>
                    <Text style={[
                      styles.achievementTitle,
                      !unlocked && styles.achievementTitleLocked,
                    ]}>
                      {achievement.title}
                    </Text>
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                    
                    <View style={styles.achievementFooter}>
                      <View style={[
                        styles.rarityBadge,
                        { backgroundColor: getRarityColor(achievement.rarity) + '20' }
                      ]}>
                        <Text style={[
                          styles.rarityText,
                          { color: getRarityColor(achievement.rarity) }
                        ]}>
                          {achievement.rarity}
                        </Text>
                      </View>
                      
                      <Text style={styles.pointsText}>+{achievement.points} 💎</Text>
                    </View>
                  </View>

                  {unlocked && (
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedText}>✓</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Unlock Modal */}
      <Modal
        visible={showUnlockModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.unlockModal,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.unlockTitle}>🎉 Achievement Unlocked! 🎉</Text>
            {currentUnlock && (
              <>
                <Text style={styles.unlockIcon}>{currentUnlock.icon}</Text>
                <Text style={styles.unlockName}>{currentUnlock.title}</Text>
                <Text style={styles.unlockDescription}>{currentUnlock.description}</Text>
                <Text style={styles.unlockPoints}>+{currentUnlock.points} poäng 💎</Text>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  levelCard: {
    backgroundColor: colors.primary,
    padding: 20,
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelPoints: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  achievementsList: {
    flex: 1,
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: colors.textSecondary,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  achievementFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  unlockedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockModal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  unlockTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  unlockIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  unlockName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  unlockDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  unlockPoints: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default AchievementSystem;
