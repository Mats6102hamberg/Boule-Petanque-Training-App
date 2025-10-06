import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../styles/colors';

const Scoreboard = ({ game }) => {
  const { teams, rounds, currentRound } = game;

  const getTotalScore = (teamId) => {
    return rounds.reduce((total, round) => {
      return total + (round.scores[teamId] || 0);
    }, 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resultat</Text>
        <Text style={styles.roundInfo}>Rond {currentRound}</Text>
      </View>

      <View style={styles.teamsContainer}>
        {teams.map((team) => (
          <View key={team.id} style={styles.teamCard}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamScore}>{getTotalScore(team.id)}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.roundsContainer}>
        <Text style={styles.sectionTitle}>Rondhistorik</Text>
        {rounds.map((round, index) => (
          <View key={index} style={styles.roundCard}>
            <Text style={styles.roundNumber}>Rond {index + 1}</Text>
            <View style={styles.roundScores}>
              {teams.map((team) => (
                <View key={team.id} style={styles.roundScore}>
                  <Text style={styles.roundTeamName}>{team.name}</Text>
                  <Text style={styles.roundPoints}>
                    {round.scores[team.id] || 0} poäng
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  roundInfo: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  teamScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  roundsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  roundCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  roundNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  roundScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roundScore: {
    alignItems: 'center',
  },
  roundTeamName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  roundPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

export default Scoreboard;
