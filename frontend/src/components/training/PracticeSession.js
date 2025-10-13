import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/colors';
import Button from '../common/Button';
import CameraView from './CameraView';

const PracticeSession = ({ sessionData, onComplete }) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [throws, setThrows] = useState([]);
  const [timer, setTimer] = useState(0);

  const exercises = [
    { id: 1, name: 'Precision Pointing', target: 10, description: 'Kasta så nära cochonnet som möjligt' },
    { id: 2, name: 'Distance Control', target: 8, description: 'Öva på olika avstånd' },
    { id: 3, name: 'Shooting Practice', target: 6, description: 'Träffa motståndarboulor' },
  ];

  useEffect(() => {
    let interval;
    if (sessionActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const startSession = () => {
    setSessionActive(true);
    setTimer(0);
    setThrows([]);
    setCurrentExercise(0);
  };

  const endSession = () => {
    setSessionActive(false);
    const sessionData = {
      duration: timer,
      exercises: exercises.slice(0, currentExercise + 1),
      throws: throws,
      completedAt: new Date(),
    };
    onComplete(sessionData);
  };

  const recordThrow = (success) => {
    const newThrow = {
      exerciseId: exercises[currentExercise].id,
      success,
      timestamp: Date.now(),
    };
    setThrows([...throws, newThrow]);
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      endSession();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentProgress = () => {
    const currentThrows = throws.filter(
      (t) => t.exerciseId === exercises[currentExercise].id
    );
    return {
      completed: currentThrows.length,
      target: exercises[currentExercise].target,
      successRate: currentThrows.length > 0
        ? (currentThrows.filter((t) => t.success).length / currentThrows.length) * 100
        : 0,
    };
  };

  if (!sessionActive) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Träningspass</Text>
        <Text style={styles.description}>
          Starta ett träningspass för att förbättra din teknik
        </Text>
        
        <View style={styles.exerciseList}>
          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              <Text style={styles.exerciseTarget}>Mål: {exercise.target} kast</Text>
            </View>
          ))}
        </View>

        <Button title="Starta träning" onPress={startSession} />
      </View>
    );
  }

  const progress = getCurrentProgress();

  const handleDistanceMeasured = (distance) => {
    // Automatiskt registrera kast baserat på avstånd
    const success = distance < 0.5; // Mindre än 50cm = lyckat kast
    recordThrow(success);
  };

  return (
    <View style={styles.container}>
      {/* Kamera View */}
      <View style={styles.cameraContainer}>
        <CameraView 
          onDistanceMeasured={handleDistanceMeasured}
          trainingMode={sessionData?.type || 'pointing'}
        />
      </View>

      {/* Training Info Overlay */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
          <Text style={styles.exerciseCounter}>
            Övning {currentExercise + 1}/{exercises.length}
          </Text>
        </View>

        <View style={styles.currentExercise}>
          <Text style={styles.exerciseName}>
            {exercises[currentExercise].name}
          </Text>
          <Text style={styles.exerciseDescription}>
            {exercises[currentExercise].description}
          </Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(progress.completed / progress.target) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.completed}/{progress.target} kast
          </Text>
          {progress.completed > 0 && (
            <Text style={styles.successRate}>
              Träffsäkerhet: {progress.successRate.toFixed(0)}%
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="✓ Lyckades"
            onPress={() => recordThrow(true)}
            variant="primary"
            style={styles.actionButton}
          />
          <Button
            title="✗ Missade"
            onPress={() => recordThrow(false)}
            variant="outline"
            style={styles.actionButton}
          />
        </View>

        {progress.completed >= progress.target && (
          <Button
            title={currentExercise < exercises.length - 1 ? 'Nästa övning' : 'Avsluta pass'}
            onPress={nextExercise}
            style={styles.nextButton}
          />
        )}

        <TouchableOpacity onPress={endSession} style={styles.endButton}>
          <Text style={styles.endButtonText}>Avsluta tidigt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cameraContainer: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  exerciseList: {
    marginBottom: 24,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  exerciseCounter: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  currentExercise: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  exerciseTarget: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 8,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 32,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  successRate: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  nextButton: {
    marginBottom: 16,
  },
  endButton: {
    padding: 12,
    alignItems: 'center',
  },
  endButtonText: {
    color: colors.error,
    fontSize: 14,
  },
});

export default PracticeSession;
