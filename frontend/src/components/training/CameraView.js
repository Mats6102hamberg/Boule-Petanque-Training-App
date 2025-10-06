import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { colors } from '../../styles/colors';

const CameraView = ({ onCapture, onAnalysis }) => {
  const camera = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState([]);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  const updateDetectedObjects = (objects) => {
    setDetectedObjects(objects);
    if (onAnalysis) {
      onAnalysis(objects);
    }
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // Analysera varje bildruta i realtid
    // Detta skulle integreras med AI-modellen
    const objects = {
      boules: [],
      cochonnet: null,
      timestamp: Date.now()
    };
    
    // Uppdatera UI med resultat
    runOnJS(updateDetectedObjects)(objects);
  }, []);

  const handleCapture = async () => {
    if (camera.current) {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
      });
      onCapture(photo);
    }
  };

  const toggleRecording = async () => {
    if (!camera.current) return;

    if (isRecording) {
      await camera.current.stopRecording();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      camera.current.startRecording({
        onRecordingFinished: (video) => {
          setIsRecording(false);
          onCapture(video);
        },
        onRecordingError: (error) => {
          console.error(error);
          setIsRecording(false);
        },
      });
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Kamerabehörighet krävs</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text>Ingen kamera hittades</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        video={true}
        frameProcessor={frameProcessor}
      />
      
      {/* Overlay för detekterade objekt */}
      <View style={styles.overlay}>
        {detectedObjects.length > 0 && (
          <View style={styles.detectionInfo}>
            <Text style={styles.detectionText}>
              Detekterade objekt: {detectedObjects.length}
            </Text>
          </View>
        )}
      </View>

      {/* Kontroller */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={handleCapture}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingActive]}
          onPress={toggleRecording}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '⏹ Stoppa' : '⏺ Spela in'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    padding: 20,
  },
  detectionInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  detectionText: {
    color: '#fff',
    fontSize: 14,
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
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  recordButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  recordingActive: {
    backgroundColor: colors.error,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraView;
