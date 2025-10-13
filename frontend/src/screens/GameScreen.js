import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import Scoreboard from '../components/game/Scoreboard';

export default function GameScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameMode, setGameMode] = useState(null);

  const handleStartGame = (mode) => {
    setGameMode(mode);
    setIsPlaying(true);
  };

  const handleEndGame = () => {
    Alert.alert(
      'Avsluta Match',
      'Är du säker på att du vill avsluta matchen?',
      [
        {
          text: 'Nej',
          style: 'cancel',
        },
        {
          text: 'Ja',
          onPress: () => {
            setIsPlaying(false);
            setGameMode(null);
          },
        },
      ]
    );
  };

  if (isPlaying) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {gameMode === 'solo' ? 'Solo Spel' : 
             gameMode === 'multiplayer' ? 'Multiplayer' : 'Turnering'}
          </Text>
          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEndGame}
          >
            <Ionicons name="close-circle" size={28} color={colors.error} />
          </TouchableOpacity>
        </View>
        <Scoreboard gameMode={gameMode} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Game Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>Spelläge</Text>
          <Text style={styles.subtitle}>
            Spela matcher och tävla mot andra
          </Text>
        </View>

        {/* Game Modes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Välj Spelläge</Text>

          <TouchableOpacity
            style={[styles.gameCard, { borderColor: colors.primary }]}
            onPress={() => handleStartGame('solo')}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Solo Spel</Text>
              <Text style={styles.cardDescription}>
                Träna själv och förbättra din poäng
              </Text>
            </View>
            <View style={styles.playButton}>
              <Ionicons name="play" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gameCard, { borderColor: colors.success }]}
            onPress={() => handleStartGame('multiplayer')}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="people" size={32} color={colors.success} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Multiplayer</Text>
              <Text style={styles.cardDescription}>
                Spela mot vänner lokalt eller online
              </Text>
            </View>
            <View style={[styles.playButton, { backgroundColor: colors.success }]}>
              <Ionicons name="play" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gameCard, { borderColor: colors.warning }]}
            onPress={() => Alert.alert('Kommer snart', 'Turneringsfunktionen är under utveckling!')}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="trophy" size={32} color={colors.warning} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Turnering</Text>
              <Text style={styles.cardDescription}>
                Delta i turneringar och vinn priser
              </Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Kommer snart</Text>
              </View>
            </View>
            <View style={[styles.playButton, { backgroundColor: colors.warning }]}>
              <Ionicons name="lock-closed" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Leaderboard Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Topplista</Text>
          <View style={styles.leaderboardCard}>
            <View style={styles.leaderboardItem}>
              <Text style={styles.rank}>1</Text>
              <Ionicons name="medal" size={24} color={colors.warning} />
              <Text style={styles.playerName}>Du</Text>
              <Text style={styles.score}>1250p</Text>
            </View>
            <View style={styles.leaderboardItem}>
              <Text style={styles.rank}>2</Text>
              <Ionicons name="medal" size={24} color="#C0C0C0" />
              <Text style={styles.playerName}>Spelare 2</Text>
              <Text style={styles.score}>1180p</Text>
            </View>
            <View style={styles.leaderboardItem}>
              <Text style={styles.rank}>3</Text>
              <Ionicons name="medal" size={24} color="#CD7F32" />
              <Text style={styles.playerName}>Spelare 3</Text>
              <Text style={styles.score}>1050p</Text>
            </View>
          </View>
        </View>

        {/* Game Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Spelregler</Text>
          <View style={styles.rulesCard}>
            <Text style={styles.rulesText}>
              <Text style={styles.bold}>Mål:</Text> Få dina boular närmare cochonnet än motståndaren{'\n\n'}
              <Text style={styles.bold}>Poäng:</Text> 1 poäng per boule närmare än motståndarens närmaste{'\n\n'}
              <Text style={styles.bold}>Vinnare:</Text> Första till 13 poäng vinner
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  endButton: {
    padding: 5,
  },
  infoSection: {
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
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  comingSoonBadge: {
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.warning + '30',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  comingSoonText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: 'bold',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    width: 30,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  rulesCard: {
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rulesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
});
