import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../styles/colors';
import StatsCard from '../common/StatsCard';

const ThrowAnalyzer = ({ analysisData }) => {
  const [metrics, setMetrics] = useState({
    accuracy: 0,
    distance: 0,
    angle: 0,
    speed: 0,
    technique: 'N/A',
  });

  useEffect(() => {
    if (analysisData) {
      analyzeThrow(analysisData);
    }
  }, [analysisData]);

  const analyzeThrow = (data) => {
    // Här skulle AI-analysen integreras
    const calculatedMetrics = {
      accuracy: calculateAccuracy(data),
      distance: calculateDistance(data),
      angle: calculateAngle(data),
      speed: calculateSpeed(data),
      technique: analyzeTechnique(data),
    };
    
    setMetrics(calculatedMetrics);
  };

  const calculateAccuracy = (data) => {
    // Beräkna noggrannhet baserat på avstånd till cochonnet
    return Math.random() * 100; // Placeholder
  };

  const calculateDistance = (data) => {
    // Beräkna avstånd med triangulering
    return Math.random() * 10; // Placeholder
  };

  const calculateAngle = (data) => {
    // Beräkna kastvinkel
    return Math.random() * 45; // Placeholder
  };

  const calculateSpeed = (data) => {
    // Beräkna kasthastighet
    return Math.random() * 20; // Placeholder
  };

  const analyzeTechnique = (data) => {
    // Analysera kastteknik
    const techniques = ['Pointing', 'Shooting', 'Rolling'];
    return techniques[Math.floor(Math.random() * techniques.length)];
  };

  const getFeedback = () => {
    const feedback = [];
    
    if (metrics.accuracy < 60) {
      feedback.push('💡 Försök sikta mer noggrant mot cochonnet');
    }
    if (metrics.angle > 35) {
      feedback.push('💡 Minska kastvinkeln för bättre kontroll');
    }
    if (metrics.speed > 15) {
      feedback.push('💡 Kasta lite mjukare för mer precision');
    }
    
    if (feedback.length === 0) {
      feedback.push('✅ Utmärkt kast! Fortsätt så här!');
    }
    
    return feedback;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Kastanalys</Text>
      
      <View style={styles.metricsGrid}>
        <StatsCard
          title="Noggrannhet"
          value={metrics.accuracy.toFixed(1)}
          unit="%"
          icon="🎯"
          trend={5}
        />
        
        <StatsCard
          title="Avstånd"
          value={metrics.distance.toFixed(2)}
          unit="m"
          icon="📏"
        />
        
        <StatsCard
          title="Kastvinkel"
          value={metrics.angle.toFixed(1)}
          unit="°"
          icon="📐"
        />
        
        <StatsCard
          title="Hastighet"
          value={metrics.speed.toFixed(1)}
          unit="m/s"
          icon="⚡"
        />
      </View>

      <View style={styles.techniqueSection}>
        <Text style={styles.sectionTitle}>Teknik</Text>
        <View style={styles.techniqueCard}>
          <Text style={styles.techniqueText}>{metrics.technique}</Text>
        </View>
      </View>

      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Feedback & Tips</Text>
        {getFeedback().map((tip, index) => (
          <View key={index} style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  metricsGrid: {
    marginBottom: 24,
  },
  techniqueSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  techniqueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  techniqueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  feedbackSection: {
    marginBottom: 24,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});

export default ThrowAnalyzer;
