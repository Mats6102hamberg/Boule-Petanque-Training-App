import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import StatsCard from '../components/common/StatsCard';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userStats, setUserStats] = useState({
    totalThrows: 0,
    sessionsCompleted: 0,
    bestAccuracy: 0,
    currentStreak: 0,
    level: 1,
    points: 0,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Välkommen tillbaka! 👋</Text>
          <Text style={styles.subtitleText}>Redo för träning?</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <StatsCard
            icon="trophy"
            label="Level"
            value={userStats.level}
            color={colors.warning}
          />
          <StatsCard
            icon="star"
            label="Poäng"
            value={userStats.points}
            color={colors.primary}
          />
          <StatsCard
            icon="flame"
            label="Streak"
            value={`${userStats.currentStreak} dagar`}
            color={colors.error}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Snabbval</Text>
          
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Training')}
          >
            <Ionicons name="fitness" size={32} color="#fff" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Starta Träning</Text>
              <Text style={styles.actionSubtitle}>Börja ett nytt träningspass</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.success }]}
            onPress={() => navigation.navigate('Game')}
          >
            <Ionicons name="game-controller" size={32} color="#fff" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Spela Match</Text>
              <Text style={styles.actionSubtitle}>Utmana dig själv eller andra</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.info }]}
            onPress={() => navigation.navigate('Challenges')}
          >
            <Ionicons name="trophy" size={32} color="#fff" />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Dagliga Utmaningar</Text>
              <Text style={styles.actionSubtitle}>Kolla dagens challenges</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Senaste Aktivitet</Text>
          <View style={styles.activityCard}>
            <Ionicons name="time-outline" size={24} color={colors.textSecondary} />
            <Text style={styles.activityText}>
              Ingen aktivitet än. Starta din första träning!
            </Text>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              Kalibrera kameran innan du börjar träna för bästa resultat!
            </Text>
          </View>
        </View>
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
  welcomeSection: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityText: {
    marginLeft: 15,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  tipCard: {
    padding: 15,
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
