import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/colors';
import Button from '../../components/common/Button';
import { triggerHaptic, HapticType, onAchievementUnlocked } from '../../utils/hapticFeedback';

/**
 * Daily Challenges Component
 * 
 * Gamification: Dagliga utmaningar för att hålla användare engagerade
 */
const DailyChallenges = ({ onChallengeComplete }) => {
  const [challenges, setChallenges] = useState([]);
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    loadDailyChallenges();
    loadStreak();
  }, []);

  const loadDailyChallenges = () => {
    // Generera dagliga utmaningar
    const dailyChallenges = [
      {
        id: 1,
        title: '🎯 Precision Master',
        description: 'Gör 10 kast med över 80% noggrannhet',
        target: 10,
        current: 0,
        reward: 50,
        type: 'accuracy',
        difficulty: 'medium',
      },
      {
        id: 2,
        title: '⚡ Speed Demon',
        description: 'Slutför ett träningspass på under 15 minuter',
        target: 1,
        current: 0,
        reward: 30,
        type: 'speed',
        difficulty: 'easy',
      },
      {
        id: 3,
        title: '🏆 Champion',
        description: 'Vinn 3 matcher idag',
        target: 3,
        current: 0,
        reward: 100,
        type: 'wins',
        difficulty: 'hard',
      },
      {
        id: 4,
        title: '📏 Distance King',
        description: 'Få en boule inom 5cm från cochonnet',
        target: 1,
        current: 0,
        reward: 75,
        type: 'distance',
        difficulty: 'hard',
      },
      {
        id: 5,
        title: '🔥 Streak Builder',
        description: 'Träna 7 dagar i rad',
        target: 7,
        current: streak,
        reward: 200,
        type: 'streak',
        difficulty: 'legendary',
      },
    ];

    setChallenges(dailyChallenges);
  };

  const loadStreak = () => {
    // Ladda streak från storage
    // För nu: mock data
    setStreak(3);
  };

  const completeChallenge = (challengeId) => {
    triggerHaptic(HapticType.SUCCESS);
    
    setChallenges(prev =>
      prev.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, current: challenge.target }
          : challenge
      )
    );

    setCompletedToday(prev => prev + 1);

    // Trigger achievement unlock animation
    setTimeout(() => {
      onAchievementUnlocked();
    }, 500);

    if (onChallengeComplete) {
      const challenge = challenges.find(c => c.id === challengeId);
      onChallengeComplete(challenge);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'hard':
        return colors.error;
      case 'legendary':
        return '#9C27B0';
      default:
        return colors.textSecondary;
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return '⭐';
      case 'medium':
        return '⭐⭐';
      case 'hard':
        return '⭐⭐⭐';
      case 'legendary':
        return '👑';
      default:
        return '⭐';
    }
  };

  const getProgress = (challenge) => {
    return Math.min((challenge.current / challenge.target) * 100, 100);
  };

  const isCompleted = (challenge) => {
    return challenge.current >= challenge.target;
  };

  return (
    <View style={styles.container}>
      {/* Header med streak */}
      <View style={styles.header}>
        <View style={styles.streakCard}>
          <Text style={styles.streakIcon}>🔥</Text>
          <View>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>Dagars streak</Text>
          </View>
        </View>
        
        <View style={styles.completedCard}>
          <Text style={styles.completedNumber}>{completedToday}/5</Text>
          <Text style={styles.completedLabel}>Klara idag</Text>
        </View>
      </View>

      {/* Challenges */}
      <ScrollView style={styles.challengesList}>
        <Text style={styles.sectionTitle}>Dagens Utmaningar</Text>
        
        {challenges.map((challenge) => (
          <TouchableOpacity
            key={challenge.id}
            style={[
              styles.challengeCard,
              isCompleted(challenge) && styles.challengeCardCompleted,
            ]}
            onPress={() => triggerHaptic(HapticType.SELECTION)}
            activeOpacity={0.7}
          >
            {/* Challenge header */}
            <View style={styles.challengeHeader}>
              <View style={styles.challengeTitleRow}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(challenge.difficulty) + '20' }
                ]}>
                  <Text style={[
                    styles.difficultyText,
                    { color: getDifficultyColor(challenge.difficulty) }
                  ]}>
                    {getDifficultyIcon(challenge.difficulty)}
                  </Text>
                </View>
              </View>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getProgress(challenge)}%` },
                    isCompleted(challenge) && styles.progressFillCompleted,
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {challenge.current}/{challenge.target}
              </Text>
            </View>

            {/* Reward */}
            <View style={styles.rewardContainer}>
              <Text style={styles.rewardIcon}>💎</Text>
              <Text style={styles.rewardText}>+{challenge.reward} poäng</Text>
              
              {isCompleted(challenge) && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✓ Klar!</Text>
                </View>
              )}
            </View>

            {/* Debug button (remove in production) */}
            {!isCompleted(challenge) && __DEV__ && (
              <Button
                title="Slutför (Debug)"
                onPress={() => completeChallenge(challenge.id)}
                variant="outline"
                style={styles.debugButton}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bonus info */}
      <View style={styles.bonusInfo}>
        <Text style={styles.bonusTitle}>💡 Tips</Text>
        <Text style={styles.bonusText}>
          Slutför alla dagliga utmaningar för en bonusbelöning på 500 poäng! 🎁
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  streakCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  streakIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  streakLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  completedCard: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.success,
  },
  completedNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
  },
  completedLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  challengesList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeCardCompleted: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: colors.success,
  },
  challengeHeader: {
    marginBottom: 12,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressFillCompleted: {
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
  },
  completedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  debugButton: {
    marginTop: 12,
  },
  bonusInfo: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  bonusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  bonusText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default DailyChallenges;
