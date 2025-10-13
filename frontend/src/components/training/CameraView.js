import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { colors } from '../../styles/colors';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const CameraView = ({ onCapture, onAnalysis, onDistanceMeasured, trainingMode }) => {
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [distance, setDistance] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const analyzeImage = async (photoUri) => {
    setIsAnalyzing(true);
    try {
      // Skapa FormData för att skicka bilden
      const formData = new FormData();
      formData.append('image', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'training-photo.jpg',
      });
      formData.append('trainingMode', trainingMode);

      // Skicka till backend för analys
      const response = await axios.post(`${API_URL}/training/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { distance: measuredDistance, objects } = response.data;
      
      setDistance(measuredDistance);
      setDetectedObjects(objects || []);
      
      if (onDistanceMeasured && measuredDistance !== null) {
        onDistanceMeasured(measuredDistance);
      }
      
      if (onAnalysis) {
        onAnalysis(response.data);
      }

      // Visa resultat
      Alert.alert(
        'Analys klar! 🎯',
        `Avstånd till cochonnet: ${(measuredDistance * 100).toFixed(1)} cm`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Analys fel:', error);
      Alert.alert('Fel', 'Kunde inte analysera bilden. Försök igen.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (onCapture) {
          onCapture(photo);
        }
        
        // Analysera bilden automatiskt
        await analyzeImage(photo.uri);
      } catch (error) {
        console.error('Capture error:', error);
        Alert.alert('Fel', 'Kunde inte ta bild');
      }
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Kamerabehörighet krävs</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        type={Camera.Constants.Type.back}
      />
      
      {/* Overlay för detekterade objekt */}
      <View style={styles.overlay}>
        {distance !== null && (
          <View style={styles.detectionInfo}>
            <Text style={styles.detectionText}>
              📏 Avstånd: {(distance * 100).toFixed(1)} cm
            </Text>
          </View>
        )}
        
        {detectedObjects.length > 0 && (
          <View style={[styles.detectionInfo, { marginTop: 10 }]}>
            <Text style={styles.detectionText}>
              🎯 Detekterade objekt: {detectedObjects.length}
            </Text>
          </View>
        )}

        {isAnalyzing && (
          <View style={styles.analyzingOverlay}>
            <Text style={styles.analyzingText}>Analyserar... 🤖</Text>
          </View>
        )}
      </View>

      {/* Kontroller */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={isAnalyzing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <Text style={styles.instructionText}>
          {trainingMode === 'pointing' && '📍 Pointing: Sikta nära cochonnet'}
          {trainingMode === 'shooting' && '💥 Shooting: Träffa motståndarens boule'}
          {trainingMode === 'rolling' && '🎳 Rolling: Rulla boulen'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    padding: 20,
    pointerEvents: 'box-none',
  },
  detectionInfo: {
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  detectionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 12,
    width: 150,
  },
  analyzingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    textAlign: 'center',
  },
});

export default CameraView;
