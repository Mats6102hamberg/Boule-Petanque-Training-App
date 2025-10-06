# Implementation Examples - Boule Pétanque Training App

## 📐 Triangulering - Grundprincip

```
cameraPosition → Object1 → Object2
         ↑          ↑         ↑
      Kameran   Boulen   Cochonnet
```

Detta dokument innehåller konkreta implementationsexempel för de viktigaste funktionerna i appen.

---

## 🎥 Camera Service Implementation

### React Native - Frame Processor

```javascript
// cameraService.js
import { Camera } from 'react-native-vision-camera';
import { useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  
  // Analysera varje bildruta i realtid
  const objects = detectBoules(frame);
  const distances = calculateDistances(objects);
  
  // Uppdatera UI med resultat
  runOnJS(updateUI)(distances);
}, []);

/**
 * Detektera boular i frame
 */
function detectBoules(frame) {
  'worklet';
  
  // Konvertera frame till format för ML-modell
  const imageData = frameToImageData(frame);
  
  // Kör objektdetektering
  const detections = runMLModel(imageData);
  
  return {
    boules: detections.boules,
    cochonnet: detections.cochonnet,
    timestamp: Date.now(),
  };
}

/**
 * Beräkna avstånd med triangulering
 */
function calculateDistances(objects) {
  'worklet';
  
  const { boules, cochonnet } = objects;
  
  if (!cochonnet || boules.length === 0) {
    return [];
  }
  
  const distances = boules.map((boule) => {
    // Triangulering
    const distance = triangulate(
      cochonnet.position,
      boule.position,
      getCameraParameters()
    );
    
    return {
      bouleId: boule.id,
      distance: distance,
      unit: 'meters',
    };
  });
  
  return distances.sort((a, b) => a.distance - b.distance);
}

/**
 * Uppdatera UI (körs på JS-tråden)
 */
function updateUI(distances) {
  console.log('Distances:', distances);
  EventEmitter.emit('distancesUpdated', distances);
}
```

---

## 🤖 Machine Learning - Objektdetektering

### Python Implementation

```python
# Machine Learning-modell för att identifiera objekt
def detect_objects(image):
    """
    Huvudfunktion för objektdetektering
    
    Args:
        image: Input-bild (numpy array)
        
    Returns:
        tuple: (boules, cochonnet)
    """
    # 1. Bildförbehandling
    processed_image = preprocess(image)
    
    # 2. Objektdetektering
    objects = ml_model.detect(processed_image)
    
    # 3. Filtrera boular vs cochonnet
    boules = filter_boules(objects)
    cochonnet = find_cochonnet(objects)
    
    return boules, cochonnet


def preprocess(image):
    """
    Bildförbehandling för bättre detektering
    """
    # Resize
    resized = cv2.resize(image, (640, 640))
    
    # Förbättra kontrast
    lab = cv2.cvtColor(resized, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    
    # Normalisera
    normalized = enhanced.astype('float32') / 255.0
    
    return normalized


def filter_boules(objects):
    """
    Filtrera ut boular från detekterade objekt
    """
    boules = []
    
    for obj in objects:
        # Kontrollera storlek (boular är ~75mm diameter)
        if 60 < obj['diameter'] < 90:
            # Kontrollera form (cirkulär)
            if obj['circularity'] > 0.8:
                # Kontrollera färg (metallisk)
                if is_metallic_color(obj['color']):
                    boules.append(obj)
    
    return boules


def find_cochonnet(objects):
    """
    Hitta cochonnet (liten röd boll)
    """
    for obj in objects:
        # Cochonnet är mindre (~30mm diameter)
        if 20 < obj['diameter'] < 40:
            # Kontrollera färg (röd)
            if is_red_color(obj['color']):
                return obj
    
    return None
```

---

## 🛠️ Tekniker för Avståndsberäkning

### 1. ARKit (iOS)

```swift
// iOS - ARKit Implementation
import ARKit

class ARDistanceCalculator {
    let arSession = ARSession()
    
    func calculateDistance(from: SCNVector3, to: SCNVector3) -> Float {
        let dx = to.x - from.x
        let dy = to.y - from.y
        let dz = to.z - from.z
        
        return sqrt(dx*dx + dy*dy + dz*dz)
    }
    
    func detectBoulePositions() -> [SCNVector3] {
        guard let frame = arSession.currentFrame else { return [] }
        
        // Använd ARKit's plane detection
        let hitTestResults = frame.hitTest(
            CGPoint(x: 0.5, y: 0.5),
            types: .existingPlaneUsingExtent
        )
        
        return hitTestResults.map { $0.worldTransform.position }
    }
}
```

### 2. ARCore (Android)

```kotlin
// Android - ARCore Implementation
import com.google.ar.core.*

class ARCoreDistanceCalculator(private val session: Session) {
    
    fun calculateDistance(pose1: Pose, pose2: Pose): Float {
        val dx = pose2.tx() - pose1.tx()
        val dy = pose2.ty() - pose1.ty()
        val dz = pose2.tz() - pose1.tz()
        
        return sqrt(dx*dx + dy*dy + dz*dz)
    }
    
    fun detectBoulePositions(frame: Frame): List<Pose> {
        val positions = mutableListOf<Pose>()
        
        // Använd ARCore's plane detection
        frame.getUpdatedTrackables(Plane::class.java).forEach { plane ->
            if (plane.trackingState == TrackingState.TRACKING) {
                positions.add(plane.centerPose)
            }
        }
        
        return positions
    }
}
```

### 3. LiDAR (iPhone/iPad)

```javascript
// React Native - LiDAR Integration
import { useLiDAR } from 'react-native-lidar';

const LiDARDistanceCalculator = () => {
  const { depthData, isAvailable } = useLiDAR();
  
  const calculateDistance = (point1, point2) => {
    if (!isAvailable || !depthData) {
      return null;
    }
    
    // Hämta djupdata för punkterna
    const depth1 = depthData.getDepth(point1.x, point1.y);
    const depth2 = depthData.getDepth(point2.x, point2.y);
    
    // Beräkna 3D-positioner
    const pos1 = pixelTo3D(point1, depth1);
    const pos2 = pixelTo3D(point2, depth2);
    
    // Euklidiskt avstånd
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  };
  
  return { calculateDistance, isAvailable };
};
```

---

## 📱 Komplett React Native Component

```javascript
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';

const BouleDetectionCamera = () => {
  const [distances, setDistances] = useState([]);
  
  const updateDistances = useCallback((newDistances) => {
    setDistances(newDistances);
  }, []);
  
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    // 1. Detektera objekt
    const objects = detectBoules(frame);
    
    // 2. Beräkna avstånd
    const calculatedDistances = calculateDistances(objects);
    
    // 3. Uppdatera UI
    runOnJS(updateDistances)(calculatedDistances);
  }, [updateDistances]);
  
  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      
      <View style={styles.overlay}>
        <Text style={styles.title}>Detekterade avstånd</Text>
        {distances.map((d, i) => (
          <Text key={i} style={styles.distance}>
            Boule {d.bouleId}: {d.distance.toFixed(2)}m
          </Text>
        ))}
      </View>
    </View>
  );
};
```

---

## 🔬 Kalibrering & Noggrannhet

### Kamerakalibrering

```python
import cv2
import numpy as np

def calibrate_camera(images, pattern_size=(9, 6)):
    """
    Kalibrera kamera med checkerboard-pattern
    """
    # Förbered objektpunkter
    objp = np.zeros((pattern_size[0] * pattern_size[1], 3), np.float32)
    objp[:, :2] = np.mgrid[0:pattern_size[0], 0:pattern_size[1]].T.reshape(-1, 2)
    
    objpoints = []  # 3D-punkter
    imgpoints = []  # 2D-punkter
    
    for img in images:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        ret, corners = cv2.findChessboardCorners(gray, pattern_size, None)
        
        if ret:
            objpoints.append(objp)
            imgpoints.append(corners)
    
    # Kalibrera
    ret, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
        objpoints, imgpoints, gray.shape[::-1], None, None
    )
    
    return camera_matrix, dist_coeffs
```

### Förbättra noggrannhet

```python
def improve_accuracy(measurements, method='kalman'):
    """
    Förbättra mätnoggrannhet med filtrering
    """
    if method == 'kalman':
        # Kalman-filter för smooth tracking
        kf = KalmanFilter(dim_x=2, dim_z=1)
        kf.x = np.array([measurements[0], 0.])  # initial state
        kf.F = np.array([[1., 1.], [0., 1.]])   # state transition
        kf.H = np.array([[1., 0.]])              # measurement function
        kf.P *= 1000.                            # covariance matrix
        kf.R = 5                                 # measurement noise
        
        filtered = []
        for m in measurements:
            kf.predict()
            kf.update(m)
            filtered.append(kf.x[0])
        
        return filtered
    
    elif method == 'moving_average':
        # Glidande medelvärde
        window_size = 5
        return np.convolve(measurements, np.ones(window_size)/window_size, mode='valid')
    
    elif method == 'median':
        # Median-filter (bra för att ta bort outliers)
        window_size = 5
        return [np.median(measurements[max(0, i-window_size):i+1]) 
                for i in range(len(measurements))]
```

---

## 🎯 Användningsexempel

### Komplett träningspass-flöde

```javascript
// TrainingSession.js
import React, { useState } from 'react';
import BouleCamera from './components/camera/BouleCamera';
import ThrowAnalyzer from './components/training/ThrowAnalyzer';

const TrainingSession = () => {
  const [currentThrow, setCurrentThrow] = useState(null);
  const [sessionData, setSessionData] = useState([]);
  
  const handleDistancesUpdate = (distances) => {
    // Spara avstånd för aktuellt kast
    setCurrentThrow({
      distances,
      timestamp: Date.now(),
    });
  };
  
  const handleThrowComplete = async () => {
    if (!currentThrow) return;
    
    // Skicka till backend för AI-analys
    const analysis = await analyzeThrow({
      distances: currentThrow.distances,
      timestamp: currentThrow.timestamp,
    });
    
    // Uppdatera session
    setSessionData([...sessionData, {
      ...currentThrow,
      analysis,
    }]);
    
    // Återställ för nästa kast
    setCurrentThrow(null);
  };
  
  return (
    <View>
      <BouleCamera onDistancesUpdate={handleDistancesUpdate} />
      <ThrowAnalyzer data={currentThrow?.analysis} />
      <Button title="Spara kast" onPress={handleThrowComplete} />
    </View>
  );
};
```

---

## 📊 Performance-optimering

```javascript
// Optimera frame processing
let frameCount = 0;
const PROCESS_EVERY_N_FRAMES = 3; // Kör endast var 3:e frame

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  
  frameCount++;
  if (frameCount % PROCESS_EVERY_N_FRAMES !== 0) {
    return; // Skippa denna frame
  }
  
  // Process frame...
}, []);
```

```python
# Optimera ML-inference
import onnxruntime as ort

# Konvertera TensorFlow-modell till ONNX för snabbare inference
session = ort.InferenceSession("model.onnx")

def fast_inference(image):
    input_name = session.get_inputs()[0].name
    output = session.run(None, {input_name: image})
    return output
```

---

## 🧪 Testning

```javascript
// Test med kända avstånd
describe('Distance Calculation', () => {
  it('should calculate correct distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 4 };
    
    const distance = calculateDistance(point1, point2);
    
    expect(distance).toBeCloseTo(5.0, 1); // Pythagoras: 3² + 4² = 5²
  });
  
  it('should handle multiple boules', () => {
    const boules = [
      { id: 1, position: { x: 1, y: 1 } },
      { id: 2, position: { x: 2, y: 2 } },
    ];
    const cochonnet = { position: { x: 0, y: 0 } };
    
    const distances = calculateDistances(boules, cochonnet);
    
    expect(distances).toHaveLength(2);
    expect(distances[0].distance).toBeLessThan(distances[1].distance);
  });
});
```

---

## 📚 Resurser & Dokumentation

- [Triangulation Guide](./triangulation-guide.md) - Detaljerad guide om triangulering
- [Architecture](./architecture.md) - Systemarkitektur
- [Setup Guide](./setup-guide.md) - Installation och setup
- [React Native Vision Camera Docs](https://react-native-vision-camera.com/)
- [ARKit Documentation](https://developer.apple.com/augmented-reality/)
- [ARCore Documentation](https://developers.google.com/ar)
- [OpenCV Tutorials](https://docs.opencv.org/4.x/d9/df8/tutorial_root.html)
