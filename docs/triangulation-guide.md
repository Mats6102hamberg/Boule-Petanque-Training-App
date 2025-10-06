# Triangulering & Objektdetektering - Teknisk Guide

## 📐 Grundprincip - Triangulering

```
cameraPosition → Object1 → Object2
         ↑          ↑         ↑
      Kameran   Boulen   Cochonnet
```

Triangulering används för att beräkna verkliga avstånd mellan objekt i 3D-rymd baserat på 2D-bilder från kameran.

### Hur det fungerar

1. **Kameraposition** - Känd referenspunkt
2. **Objekt 1 (Boule)** - Detekterad position i bilden
3. **Objekt 2 (Cochonnet)** - Detekterad position i bilden
4. **Beräkning** - Använd geometri och kameramatris för att få verkligt avstånd

---

## 🛠️ Tekniker att använda

### 1. **ARKit** (iOS) / **ARCore** (Android)
- Ger direkt djupinformation från enheten
- Bäst för realtidsapplikationer
- Inbyggt stöd för plan-detektering
- Hög noggrannhet

**Fördelar:**
- Native integration
- Automatisk kalibrering
- World tracking
- Ljusestimering

**Implementation:**
```javascript
// iOS - ARKit
import { ARView } from 'react-native-arkit';

// Android - ARCore
import { ARCoreView } from 'react-native-arcore';
```

### 2. **Stereo Vision** (med två kameror)
- Använder två kameror för djupberäkning
- Simulerar mänskligt seende
- Kräver kalibrering mellan kamerorna

**Fördelar:**
- Passiv teknik (ingen projektion)
- Fungerar i olika ljusförhållanden
- Bra för utomhusbruk

**Nackdelar:**
- Kräver två kameror
- Mer komplex kalibrering
- Beräkningsintensivt

### 3. **LiDAR** (på nyare iPhone/iPad)
- Laser-baserad avståndsmätning
- Extremt noggrann (±1cm)
- Fungerar i mörker

**Enheter med LiDAR:**
- iPhone 12 Pro/Pro Max och senare
- iPhone 13 Pro/Pro Max
- iPhone 14 Pro/Pro Max
- iPhone 15 Pro/Pro Max
- iPad Pro (2020 och senare)

**Implementation:**
```javascript
import { useLiDAR } from 'react-native-lidar';

const depthData = useLiDAR();
```

---

## 🤖 Machine Learning - Objektdetektering

### Python Implementation

```python
# Machine Learning-modell för att identifiera objekt
def detect_objects(image):
    """
    Detektera boular och cochonnet i bild
    
    Args:
        image: Input-bild (numpy array)
        
    Returns:
        tuple: (boules, cochonnet)
    """
    # 1. Bildförbehandling
    processed_image = preprocess(image)
    
    # 2. Objektdetektering med ML-modell
    objects = ml_model.detect(processed_image)
    
    # 3. Filtrera boular vs cochonnet
    boules = filter_boules(objects)
    cochonnet = find_cochonnet(objects)
    
    return boules, cochonnet


def preprocess(image):
    """
    Förbehandla bild för bättre detektering
    """
    # Resize till modellens input-storlek
    resized = cv2.resize(image, (640, 640))
    
    # Normalisera pixelvärden
    normalized = resized.astype('float32') / 255.0
    
    # Förbättra kontrast
    lab = cv2.cvtColor(normalized, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    
    return enhanced


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
                # Kontrollera färg (metallisk/silver)
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
            # Kontrollera färg (röd/orange)
            if is_red_color(obj['color']):
                return obj
    
    return None
```

---

## 📱 React Native Implementation

### Camera Service med Frame Processor

```javascript
// cameraService.js
import { Camera } from 'react-native-vision-camera';
import { useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';

/**
 * Frame processor för realtidsanalys
 * Körs på varje bildruta från kameran
 */
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
  
  // Konvertera frame till format som ML-modellen förstår
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
 * Beräkna avstånd mellan objekt
 */
function calculateDistances(objects) {
  'worklet';
  
  const { boules, cochonnet } = objects;
  
  if (!cochonnet || boules.length === 0) {
    return [];
  }
  
  const distances = boules.map((boule) => {
    // Triangulering för att få verkligt avstånd
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
  
  // Sortera efter avstånd (närmast först)
  return distances.sort((a, b) => a.distance - b.distance);
}


/**
 * Triangulering för avståndsberäkning
 */
function triangulate(point1, point2, cameraParams) {
  'worklet';
  
  // Beräkna pixelavstånd
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const pixelDistance = Math.sqrt(dx * dx + dy * dy);
  
  // Konvertera till verkligt avstånd
  const focalLength = cameraParams.focalLength;
  const sensorSize = cameraParams.sensorSize;
  const imageSize = cameraParams.imageSize;
  
  // Formel: realDistance = (pixelDistance × sensorSize × distance) / (focalLength × imageSize)
  const estimatedDistance = (focalLength * sensorSize) / imageSize;
  const realDistance = (pixelDistance * estimatedDistance) / focalLength;
  
  return realDistance;
}


/**
 * Uppdatera UI med detektionsresultat
 */
function updateUI(distances) {
  // Denna funktion körs på JS-tråden (inte worklet)
  console.log('Detected distances:', distances);
  
  // Uppdatera state eller skicka event
  EventEmitter.emit('distancesUpdated', distances);
}
```

---

## 🎯 Komplett Exempel - Camera Component

```javascript
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';

const BouleCamera = () => {
  const [distances, setDistances] = useState([]);
  const [detectedObjects, setDetectedObjects] = useState({ boules: [], cochonnet: null });

  // Callback för att uppdatera UI från worklet
  const updateDetections = useCallback((objects, calculatedDistances) => {
    setDetectedObjects(objects);
    setDistances(calculatedDistances);
  }, []);

  // Frame processor
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    try {
      // 1. Detektera objekt
      const objects = detectBoules(frame);
      
      // 2. Beräkna avstånd
      const distances = calculateDistances(objects);
      
      // 3. Uppdatera UI
      runOnJS(updateDetections)(objects, distances);
    } catch (error) {
      console.error('Frame processing error:', error);
    }
  }, [updateDetections]);

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      
      {/* Overlay med detektionsinfo */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Detekterade objekt</Text>
        
        {/* Boular */}
        <Text style={styles.subtitle}>
          Boular: {detectedObjects.boules.length}
        </Text>
        
        {/* Avstånd */}
        {distances.map((d, index) => (
          <Text key={index} style={styles.distance}>
            Boule {d.bouleId}: {d.distance.toFixed(2)}m
          </Text>
        ))}
        
        {/* Cochonnet */}
        {detectedObjects.cochonnet && (
          <Text style={styles.cochonnet}>
            ✓ Cochonnet detekterad
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  distance: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 8,
  },
  cochonnet: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 8,
  },
});

export default BouleCamera;
```

---

## 📊 Noggrannhet & Optimering

### Förbättra noggrannhet

1. **Kamerakalibrering**
   - Mät kamerans intrinsiska parametrar
   - Korrigera för lins-distorsion
   - Använd checkerboard-pattern för kalibrering

2. **Referensobjekt**
   - Använd känd storlek (cochonnet = 30mm)
   - Kalibrerar automatiskt för avstånd

3. **Flera mätningar**
   - Medelvärde över flera frames
   - Filtrera bort outliers
   - Kalman-filter för smooth tracking

4. **Ljusförhållanden**
   - Anpassa för olika ljus
   - HDR-stöd
   - Skuggkompensation

### Performance-optimering

```javascript
// Kör inte varje frame
let frameCount = 0;
const PROCESS_EVERY_N_FRAMES = 3;

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  
  frameCount++;
  if (frameCount % PROCESS_EVERY_N_FRAMES !== 0) {
    return; // Skippa denna frame
  }
  
  // Process frame...
}, []);
```

---

## 🔬 Testning & Validering

### Test med kända avstånd

```javascript
// Placera objekt på kända avstånd och verifiera
const testDistances = [
  { actual: 0.5, measured: 0.48, error: 0.02 },
  { actual: 1.0, measured: 0.97, error: 0.03 },
  { actual: 2.0, measured: 2.05, error: 0.05 },
];

const averageError = testDistances.reduce((sum, t) => sum + t.error, 0) / testDistances.length;
console.log(`Average error: ${averageError.toFixed(3)}m`);
```

---

## 📚 Resurser

- [ARKit Documentation](https://developer.apple.com/augmented-reality/)
- [ARCore Documentation](https://developers.google.com/ar)
- [React Native Vision Camera](https://react-native-vision-camera.com/)
- [OpenCV Triangulation](https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html)
- [TensorFlow Object Detection](https://www.tensorflow.org/lite/examples/object_detection/overview)
