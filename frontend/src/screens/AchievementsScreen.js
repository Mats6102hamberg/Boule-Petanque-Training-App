import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors } from '../styles/colors';
import AchievementSystem from '../features/gamification/AchievementSystem';

export default function AchievementsScreen() {
  const userStats = {
    totalThrows: 156,
    sessionsCompleted: 23,
    gamesWon: 12,
    bestAccuracy: 87.5,
    currentStreak: 7,
    level: 5,
    points: 2450,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>
            Lås upp achievements genom att nå olika milstolpar
          </Text>
        </View>
        <AchievementSystem userStats={userStats} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
