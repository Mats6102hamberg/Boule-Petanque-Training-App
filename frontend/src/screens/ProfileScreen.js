import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import StatsCard from '../components/common/StatsCard';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState({
    name: 'Pétanque Spelare',
    level: 5,
    points: 2450,
    totalThrows: 156,
    sessionsCompleted: 23,
    gamesWon: 12,
    bestAccuracy: 87.5,
    currentStreak: 7,
    achievements: 8,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={50} color={colors.primary} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles.levelText}>Level {userProfile.level}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userProfile.points}</Text>
            <Text style={styles.statLabel}>Poäng</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userProfile.currentStreak}</Text>
            <Text style={styles.statLabel}>Dagars Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userProfile.achievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        {/* Detailed Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Statistik</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Ionicons name="fitness" size={24} color={colors.primary} />
              <Text style={styles.statRowLabel}>Totalt Kast</Text>
              <Text style={styles.statRowValue}>{userProfile.totalThrows}</Text>
            </View>

            <View style={styles.statRow}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.statRowLabel}>Träningspass</Text>
              <Text style={styles.statRowValue}>{userProfile.sessionsCompleted}</Text>
            </View>

            <View style={styles.statRow}>
              <Ionicons name="trophy" size={24} color={colors.warning} />
              <Text style={styles.statRowLabel}>Matcher Vunna</Text>
              <Text style={styles.statRowValue}>{userProfile.gamesWon}</Text>
            </View>

            <View style={styles.statRow}>
              <Ionicons name="target" size={24} color={colors.error} />
              <Text style={styles.statRowLabel}>Bästa Noggrannhet</Text>
              <Text style={styles.statRowValue}>{userProfile.bestAccuracy}%</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Inställningar</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
            <Text style={styles.menuText}>Inställningar</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Achievements')}
          >
            <Ionicons name="trophy-outline" size={24} color={colors.text} />
            <Text style={styles.menuText}>Achievements</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="share-social-outline" size={24} color={colors.text} />
            <Text style={styles.menuText}>Dela Profil</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color={colors.text} />
            <Text style={styles.menuText}>Hjälp & Support</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Boule Pétanque Training App</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
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
  profileHeader: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.warning + '20',
    borderRadius: 20,
  },
  levelText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.warning,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
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
  statsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statRowLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  statRowValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
