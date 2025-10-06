import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../styles/colors';
import Button from '../components/common/Button';
import Header from '../components/common/Header';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  calibrateCamera,
  calibrateWithReferenceObject,
  getCalibration,
  isCalibrated,
  clearCalibration,
  validateCalibration,
} from '../utils/cameraCalibration';

/**
 * Kalibreringsscreen
 * 
 * Lösning - Kalibrering:
 * Användaren fotograferar ett objekt med känt avstånd/storlek
 * för att beräkna scale factor och förbättra noggrannheten
 */
const CalibrationScreen = ({ navigation }) => {
  const [calibrated, setCalibrated] = useState(false);
  const [calibrationData, setCalibrationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    checkCalibration();
  }, []);

  const checkCalibration = async () => {
    const isCal = await isCalibrated();
    setCalibrated(isCal);
    
    if (isCal) {
      const data = await getCalibration();
      setCalibrationData(data);
    }
  };

  const handleCalibrateWithCochonnet = async () => {
    setLoading(true);
    try {
      Alert.alert(
        'Kalibrera med Cochonnet',
        'Placera en cochonnet (30mm) i bilden och fotografera den.',
        [
          {
            text: 'Avbryt',
            style: 'cancel',
            onPress: () => setLoading(false),
          },
          {
            text: 'Fortsätt',
            onPress: async () => {
              try {
                const result = await calibrateWithReferenceObject('cochonnet');
                setCalibrationData(result);
                setCalibrated(true);
                Alert.alert('✅ Kalibrering klar!', 'Kameran är nu kalibrerad med cochonnet.');
              } catch (error) {
                Alert.alert('❌ Fel', error.message);
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('❌ Fel', error.message);
      setLoading(false);
    }
  };

  const handleCalibrateWithBoule = async () => {
    setLoading(true);
    try {
      Alert.alert(
        'Kalibrera med Boule',
        'Placera en boule (75.5mm) i bilden och fotografera den.',
        [
          {
            text: 'Avbryt',
            style: 'cancel',
            onPress: () => setLoading(false),
          },
          {
            text: 'Fortsätt',
            onPress: async () => {
              try {
                const result = await calibrateWithReferenceObject('boule');
                setCalibrationData(result);
                setCalibrated(true);
                Alert.alert('✅ Kalibrering klar!', 'Kameran är nu kalibrerad med boule.');
              } catch (error) {
                Alert.alert('❌ Fel', error.message);
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('❌ Fel', error.message);
      setLoading(false);
    }
  };

  const handleManualCalibration = async () => {
    Alert.alert(
      'Manuell Kalibrering',
      'Ange känt avstånd och storlek för kalibrering.',
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Fortsätt',
          onPress: async () => {
            // I produktion: visa input-dialog
            const knownDistance = 1.0; // meter
            const knownSize = 0.1; // meter
            
            setLoading(true);
            try {
              const scaleFactor = await calibrateCamera(knownDistance, knownSize);
              const data = await getCalibration();
              setCalibrationData(data);
              setCalibrated(true);
              Alert.alert('✅ Kalibrering klar!', `Scale factor: ${scaleFactor.toFixed(4)}`);
            } catch (error) {
              Alert.alert('❌ Fel', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleValidateCalibration = async () => {
    setLoading(true);
    try {
      const result = await validateCalibration();
      setValidationResult(result);
      
      if (result.valid) {
        Alert.alert('✅ Validering OK', 'Kalibreringen är giltig.');
      } else {
        Alert.alert('⚠️ Validering misslyckades', result.error);
      }
    } catch (error) {
      Alert.alert('❌ Fel', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCalibration = async () => {
    Alert.alert(
      'Rensa Kalibrering',
      'Är du säker på att du vill rensa kalibreringen?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Rensa',
          style: 'destructive',
          onPress: async () => {
            await clearCalibration();
            setCalibrated(false);
            setCalibrationData(null);
            setValidationResult(null);
            Alert.alert('✅ Klar', 'Kalibreringen har rensats.');
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner message="Kalibrerar kamera..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Kamerakalibrering"
        leftAction={{
          icon: '←',
          onPress: () => navigation.goBack(),
        }}
      />

      <View style={styles.content}>
        {/* Status */}
        <View style={[styles.statusCard, calibrated ? styles.calibratedCard : styles.notCalibratedCard]}>
          <Text style={styles.statusIcon}>{calibrated ? '✅' : '⚠️'}</Text>
          <Text style={styles.statusTitle}>
            {calibrated ? 'Kamera Kalibrerad' : 'Kamera Ej Kalibrerad'}
          </Text>
          <Text style={styles.statusDescription}>
            {calibrated
              ? 'Din kamera är kalibrerad för noggranna mätningar.'
              : 'Kalibrera kameran för bättre noggrannhet.'}
          </Text>
        </View>

        {/* Kalibrering info */}
        {calibrationData && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Kalibreringsdata</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Scale Factor:</Text>
              <Text style={styles.infoValue}>
                {calibrationData.scaleFactor?.toFixed(6) || 'N/A'}
              </Text>
            </View>
            
            {calibrationData.referenceObject && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Referensobjekt:</Text>
                <Text style={styles.infoValue}>{calibrationData.referenceObject}</Text>
              </View>
            )}
            
            {calibrationData.knownSize && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Känd storlek:</Text>
                <Text style={styles.infoValue}>
                  {(calibrationData.knownSize * 1000).toFixed(1)}mm
                </Text>
              </View>
            )}
            
            {calibrationData.timestamp && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Datum:</Text>
                <Text style={styles.infoValue}>
                  {new Date(calibrationData.timestamp).toLocaleDateString('sv-SE')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Validering */}
        {validationResult && (
          <View style={[styles.validationCard, validationResult.valid ? styles.validCard : styles.invalidCard]}>
            <Text style={styles.validationTitle}>
              {validationResult.valid ? '✅ Validering OK' : '⚠️ Validering Misslyckades'}
            </Text>
            {validationResult.error && (
              <Text style={styles.validationText}>Fel: {validationResult.error}</Text>
            )}
            {validationResult.age && (
              <Text style={styles.validationText}>Ålder: {validationResult.age}</Text>
            )}
          </View>
        )}

        {/* Kalibreringsknappar */}
        <View style={styles.buttonsContainer}>
          <Text style={styles.sectionTitle}>Kalibreringsmetoder</Text>
          
          <Button
            title="📏 Kalibrera med Cochonnet (30mm)"
            onPress={handleCalibrateWithCochonnet}
            variant="primary"
            style={styles.button}
          />
          
          <Button
            title="⚪ Kalibrera med Boule (75.5mm)"
            onPress={handleCalibrateWithBoule}
            variant="primary"
            style={styles.button}
          />
          
          <Button
            title="✏️ Manuell Kalibrering"
            onPress={handleManualCalibration}
            variant="outline"
            style={styles.button}
          />
        </View>

        {/* Åtgärder */}
        {calibrated && (
          <View style={styles.actionsContainer}>
            <Button
              title="🔍 Validera Kalibrering"
              onPress={handleValidateCalibration}
              variant="secondary"
              style={styles.button}
            />
            
            <Button
              title="🗑️ Rensa Kalibrering"
              onPress={handleClearCalibration}
              variant="outline"
              style={styles.button}
            />
          </View>
        )}

        {/* Info-text */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>💡 Tips</Text>
          <Text style={styles.helpText}>
            • Kalibrera i samma ljusförhållanden som du ska använda appen{'\n'}
            • Använd en cochonnet eller boule för bästa resultat{'\n'}
            • Kalibrera om efter 7 dagar för bästa noggrannhet{'\n'}
            • Håll kameran stilla under kalibreringen
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calibratedCard: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: colors.success,
  },
  notCalibratedCard: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: colors.warning,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  validationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  validCard: {
    backgroundColor: '#E8F5E9',
  },
  invalidCard: {
    backgroundColor: '#FFEBEE',
  },
  validationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  validationText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  button: {
    marginBottom: 12,
  },
  helpCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default CalibrationScreen;
