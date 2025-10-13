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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import CameraView from '../components/training/CameraView';
import PracticeSession from '../components/training/PracticeSession';
import ThrowAnalyzer from '../components/training/ThrowAnalyzer';

export default function TrainingScreen() {
  const navigation = useNavigation();
  const [isTraining, setIsTraining] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  const handleStartTraining = () => {
    Alert.alert(
      'Starta Träning',
      'Välj träningstyp:',
      [
        {
          text: 'Pointing',
          onPress: () => startSession('pointing'),
        },
        {
          text: 'Shooting',
          onPress: () => startSession('shooting'),
        },
        {
          text: 'Rolling',
          onPress: () => startSession('rolling'),
        },
        {
          text: 'Avbryt',
          style: 'cancel',
        },
      ]
    );
  };

  const startSession = (type) => {
    setSessionData({
      type,
      startTime: new Date(),
      throws: [],
    });
    setIsTraining(true);
  };

  const handleStopTraining = () => {
    Alert.alert(
      'Avsluta Träning',
      'Är du säker på att du vill avsluta träningen?',
      [
        {
          text: 'Nej',
          style: 'cancel',
        },
        {
          text: 'Ja',
          onPress: () => {
            setIsTraining(false);
            setSessionData(null);
          },
        },
      ]
    );
  };

  const handleCalibration = () => {
    navigation.navigate('Calibration');
  };

  if (isTraining) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopTraining}
          >
            <Ionicons name="stop-circle" size={32} color={colors.error} />
            <Text style={styles.stopButtonText}>Stoppa</Text>
          </TouchableOpacity>
        </View>
        <PracticeSession sessionData={sessionData} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Training Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>Träningsläge</Text>
          <Text style={styles.subtitle}>
            Förbättra din teknik med AI-driven analys
          </Text>
        </View>

        {/* Training Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Välj Träningstyp</Text>

          <TouchableOpacity
            style={styles.trainingCard}
            onPress={() => startSession('pointing')}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="locate" size={32} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Pointing</Text>
              <Text style={styles.cardDescription}>
                Träna på att placera boulen nära cochonnet
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.trainingCard}
            onPress={() => startSession('shooting')}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="flash" size={32} color={colors.error} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Shooting</Text>
              <Text style={styles.cardDescription}>
                Träna på att träffa och flytta motståndarens boular
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.trainingCard}
            onPress={() => startSession('rolling')}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="arrow-forward-circle" size={32} color={colors.success} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Rolling</Text>
              <Text style={styles.cardDescription}>
                Träna på att rulla boulen längs marken
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verktyg</Text>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={handleCalibration}
          >
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
            <Text style={styles.toolText}>Kalibrera Kamera</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Träningstips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              • Kalibrera kameran innan varje session{'\n'}
              • Håll kameran stabil under kastet{'\n'}
              • Träna på olika avstånd{'\n'}
              • Analysera din teknik efter varje kast
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
    justifyContent: 'flex-end',
    padding: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  stopButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
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
  trainingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toolText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  tipCard: {
    padding: 15,
    backgroundColor: colors.info + '20',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
});
