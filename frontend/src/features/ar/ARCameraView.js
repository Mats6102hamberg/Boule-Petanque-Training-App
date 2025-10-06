import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import VirtualTrajectory from './VirtualTrajectory';
import { colors } from '../../styles/colors';
import { triggerHaptic, HapticType } from '../../utils/hapticFeedback';

/**
 * AR Camera View
 * 
 * Kombinerar kamera med AR-overlays:
 * - Virtual trajectory
 * - 3D ground plane
 * - Distance measurements
 * - Object highlighting
 */
const ARCameraView = ({ onThrowDetected }) => {
  const devices = useCameraDevices();
  const device = devices.back;
  
  const [arEnabled, setArEnabled] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showGroundPlane, setShowGroundPlane] = useState(false);
  
  const [detectedObjects, setDetectedObjects] = useState({
    boules: [],
    cochonnet: null,
  });
  
  const [trajectoryPoints, setTrajectoryPoints] = useState({
    start: null,
    target: null,
  });
  
  const [measurements, setMeasurements] = useState([]);
  const [planeCorners, setPlaneCorners] = useState(null);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    try {
      // Detektera objekt
      const objects = detectObjects(frame);
      
      // Uppdatera UI
      runOnJS(updateDetections)(objects);
      
      // Detektera ground plane (ARKit/ARCore)
      if (frame.planesDetected) {
        const plane = frame.planesDetected[0];
        runOnJS(updateGroundPlane)(plane);
      }
    } catch (error) {
      console.error('AR Frame processing error:', error);
    }
  }, []);

  const detectObjects = (frame) => {
    'worklet';
    // Placeholder - skulle använda ML Kit eller TensorFlow Lite
    return {
      boules: [],
      cochonnet: null,
    };
  };

  const updateDetections = (objects) => {
    setDetectedObjects(objects);
    
    // Uppdatera trajectory points
    if (objects.cochonnet) {
      setTrajectoryPoints(prev => ({
        ...prev,
        target: {
          x: objects.cochonnet.center.x,
          y: objects.cochonnet.center.y,
        },
      }));
      
      triggerHaptic(HapticType.LIGHT);
    }
    
    // Beräkna measurements
    if (objects.boules.length > 0 && objects.cochonnet) {
      const newMeasurements = objects.boules.map(boule => ({
        from: boule.center,
        to: objects.cochonnet.center,
        distance: calculateDistance(boule.center, objects.cochonnet.center),
        labelPosition: {
          x: (boule.center.x + objects.cochonnet.center.x) / 2,
          y: (boule.center.y + objects.cochonnet.center.y) / 2,
        },
      }));
      
      setMeasurements(newMeasurements);
    }
  };

  const updateGroundPlane = (plane) => {
    if (plane && plane.corners) {
      setPlaneCorners(plane.corners);
      setShowGroundPlane(true);
    }
  };

  const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleScreenTouch = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    
    setTrajectoryPoints(prev => ({
      ...prev,
      start: { x: locationX, y: locationY },
    }));
    
    triggerHaptic(HapticType.SELECTION);
  };

  const toggleAR = () => {
    setArEnabled(!arEnabled);
    triggerHaptic(HapticType.SELECTION);
  };

  const toggleTrajectory = () => {
    setShowTrajectory(!showTrajectory);
    triggerHaptic(HapticType.SELECTION);
  };

  const toggleMeasurements = () => {
    setShowMeasurements(!showMeasurements);
    triggerHaptic(HapticType.SELECTION);
  };

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ingen kamera hittades</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />

      {/* AR Overlays */}
      {arEnabled && (
        <>
          {/* Virtual Trajectory */}
          {showTrajectory && (
            <VirtualTrajectory
              startPoint={trajectoryPoints.start}
              targetPoint={trajectoryPoints.target}
              throwType="pointing"
              showIdealPath={true}
            />
          )}

          {/* Object Highlights */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Highlight boules */}
            {detectedObjects.boules.map((boule, index) => (
              <View
                key={index}
                style={[
                  styles.objectHighlight,
                  {
                    left: boule.center.x - 30,
                    top: boule.center.y - 30,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Text style={styles.objectLabel}>B{index + 1}</Text>
              </View>
            ))}

            {/* Highlight cochonnet */}
            {detectedObjects.cochonnet && (
              <View
                style={[
                  styles.objectHighlight,
                  {
                    left: detectedObjects.cochonnet.center.x - 25,
                    top: detectedObjects.cochonnet.center.y - 25,
                    borderColor: '#FF6B6B',
                    width: 50,
                    height: 50,
                  },
                ]}
              >
                <Text style={[styles.objectLabel, { color: '#FF6B6B' }]}>C</Text>
              </View>
            )}

            {/* Distance measurements */}
            {showMeasurements && measurements.map((measurement, index) => (
              <View
                key={index}
                style={[
                  styles.measurementLabel,
                  {
                    left: measurement.labelPosition.x - 40,
                    top: measurement.labelPosition.y - 15,
                  },
                ]}
              >
                <Text style={styles.measurementText}>
                  {measurement.distance.toFixed(2)}m
                </Text>
              </View>
            ))}
          </View>

          {/* Touch overlay for setting start point */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleScreenTouch}
          />
        </>
      )}

      {/* AR Controls */}
      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, arEnabled && styles.controlButtonActive]}
            onPress={toggleAR}
          >
            <Text style={styles.controlButtonText}>
              {arEnabled ? '🎯 AR On' : '🎯 AR Off'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, showTrajectory && styles.controlButtonActive]}
            onPress={toggleTrajectory}
            disabled={!arEnabled}
          >
            <Text style={styles.controlButtonText}>📐 Bana</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, showMeasurements && styles.controlButtonActive]}
            onPress={toggleMeasurements}
            disabled={!arEnabled}
          >
            <Text style={styles.controlButtonText}>📏 Mått</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 Tryck på skärmen för att sätta startpunkt
          </Text>
          {detectedObjects.cochonnet && (
            <Text style={styles.infoText}>
              ✓ Cochonnet detekterad
            </Text>
          )}
          {detectedObjects.boules.length > 0 && (
            <Text style={styles.infoText}>
              ✓ {detectedObjects.boules.length} boule(r) detekterade
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  objectHighlight: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  objectLabel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  measurementLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.info,
  },
  measurementText: {
    color: colors.info,
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  controlButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default ARCameraView;
