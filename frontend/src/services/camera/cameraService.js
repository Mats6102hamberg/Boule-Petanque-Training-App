import { Camera } from 'react-native-vision-camera';
import { useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';

/**
 * Camera Service för Boule Pétanque Training App
 * 
 * Grundprincip - Triangulering:
 *     cameraPosition → Object1 → Object2
 *              ↑          ↑         ↑
 *           Kameran   Boulen   Cochonnet
 * 
 * Tekniker som används:
 * - ARKit (iOS) / ARCore (Android) - för djupdata
 * - Stereo Vision (med två kameror) - för 3D-rekonstruktion
 * - LiDAR (på nyare iPhone/iPad) - för exakta mätningar
 */

class CameraService {
  constructor() {
    this.isInitialized = false;
    this.detectionCallbacks = [];
  }

  async initialize() {
    try {
      const permission = await Camera.requestCameraPermission();
      if (permission === 'authorized') {
        this.isInitialized = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Camera initialization error:', error);
      return false;
    }
  }

  /**
   * Frame processor för realtidsanalys av boular
   * Använder triangulering och objektdetektering
   * 
   * Exempel användning:
   * const frameProcessor = useFrameProcessor((frame) => {
   *   'worklet';
   *   // Analysera varje bildruta i realtid
   *   const objects = detectBoules(frame);
   *   const distances = calculateDistances(objects);
   *   
   *   // Uppdatera UI med resultat
   *   runOnJS(updateUI)(distances);
   * }, []);
   */
  createFrameProcessor(onDetection) {
    return useFrameProcessor((frame) => {
      'worklet';
      
      try {
        // 1. Preprocessa bilden
        const processedFrame = this.preprocessFrame(frame);
        
        // 2. Detektera objekt (boular och cochonnet)
        // Machine Learning-modell för att identifiera objekt:
        // - Bildförbehandling
        // - Objektdetektering med ML
        // - Filtrera boular vs cochonnet
        const detectedObjects = this.detectObjects(processedFrame);
        
        // 3. Beräkna avstånd med triangulering
        // Grundprincip: cameraPosition → Boule → Cochonnet
        const distances = this.calculateDistances(detectedObjects, frame);
        
        // 4. Analysera kastteknik
        const analysis = this.analyzeTechnique(detectedObjects, frame);
        
        const result = {
          objects: detectedObjects,
          distances: distances,
          analysis: analysis,
          timestamp: Date.now(),
        };
        
        // Skicka resultat till UI-tråden
        runOnJS(onDetection)(result);
      } catch (error) {
        console.error('Frame processing error:', error);
      }
    }, []);
  }

  /**
   * Preprocessa bildrutan för bättre objektdetektering
   */
  preprocessFrame(frame) {
    'worklet';
    // Implementera bildförbehandling:
    // - Justera kontrast
    // - Minska brus
    // - Normalisera ljusstyrka
    return frame;
  }

  /**
   * Detektera boular och cochonnet i bilden
   * Använder ML-modell för objektdetektering
   */
  detectObjects(frame) {
    'worklet';
    
    // Detta skulle integreras med TensorFlow Lite eller Core ML
    // För nu returnerar vi mock-data
    const objects = {
      boules: [
        {
          id: 1,
          position: { x: 0.5, y: 0.6 },
          confidence: 0.95,
          color: 'silver',
        },
      ],
      cochonnet: {
        position: { x: 0.5, y: 0.5 },
        confidence: 0.92,
      },
    };
    
    return objects;
  }

  /**
   * Beräkna avstånd med triangulering
   * Grundprincip: cameraPosition → Object1 → Object2
   */
  calculateDistances(objects, frame) {
    'worklet';
    
    const { boules, cochonnet } = objects;
    
    if (!cochonnet || !boules || boules.length === 0) {
      return [];
    }
    
    const distances = boules.map((boule) => {
      // Triangulering med kamera som referenspunkt
      const distance = this.triangulate(
        cochonnet.position,
        boule.position,
        frame
      );
      
      return {
        bouleId: boule.id,
        distanceToCochonnet: distance,
        unit: 'meters',
      };
    });
    
    return distances.sort((a, b) => a.distanceToCochonnet - b.distanceToCochonnet);
  }

  /**
   * Triangulering för att beräkna verkligt avstånd
   * Använder ARKit (iOS) / ARCore (Android) för djupdata
   */
  triangulate(point1, point2, frame) {
    'worklet';
    
    // Grundläggande triangulering
    // I produktion skulle detta använda:
    // - ARKit/ARCore för djupdata
    // - LiDAR (på nyare enheter)
    // - Stereo vision (om tillgängligt)
    
    const pixelDistance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
    
    // Konvertera pixelavstånd till verkligt avstånd
    // Detta kräver kalibrering baserat på kamerans egenskaper
    const realDistance = this.pixelsToMeters(pixelDistance, frame);
    
    return realDistance;
  }

  /**
   * Konvertera pixelavstånd till meter
   * Kräver kamerakalibrering
   * 
   * Omvandling pixels → centimeter:
   * const cmPerPixel = (sensorWidth * cameraDistance) / (focalLength * imageWidth);
   * return pixels * cmPerPixel;
   */
  pixelsToMeters(pixelDistance, frame) {
    'worklet';
    
    // Kalibreringsfaktorer (skulle konfigureras per enhet)
    const focalLength = 1000; // pixels
    const sensorHeight = 0.006; // meters (6mm)
    const imageHeight = frame.height;
    
    // Enkel approximation
    // I produktion: använd kameramatris och distorsionskoefficienter
    const estimatedDistance = (focalLength * sensorHeight) / imageHeight;
    const realDistance = (pixelDistance * estimatedDistance) / focalLength;
    
    return realDistance;
  }
  
  /**
   * Pythagoras sats i 3D för avståndsberäkning
   * Används när vi har 3D-koordinater från ARKit/ARCore/LiDAR
   */
  calculateDistance3D(pointA, pointB) {
    'worklet';
    
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    const dz = pointA.z - pointB.z;
    
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }

  /**
   * Analysera kastteknik baserat på rörelsemönster
   */
  analyzeTechnique(objects, frame) {
    'worklet';
    
    // Analysera:
    // - Kastvinkel
    // - Hastighet
    // - Rotation
    // - Bana
    
    return {
      technique: 'pointing', // 'pointing', 'shooting', 'rolling'
      angle: 30, // grader
      speed: 5.2, // m/s
      rotation: 'backspin',
      quality: 0.85, // 0-1
    };
  }

  /**
   * Ta foto med optimal kvalitet
   */
  async takePhoto(camera) {
    try {
      const photo = await camera.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
        enableAutoStabilization: true,
      });
      return photo;
    } catch (error) {
      console.error('Photo capture error:', error);
      throw error;
    }
  }

  /**
   * Spela in video för senare analys
   */
  async startRecording(camera, onFinished) {
    try {
      camera.startRecording({
        onRecordingFinished: (video) => {
          onFinished(video);
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
        },
      });
    } catch (error) {
      console.error('Start recording error:', error);
      throw error;
    }
  }

  async stopRecording(camera) {
    try {
      await camera.stopRecording();
    } catch (error) {
      console.error('Stop recording error:', error);
      throw error;
    }
  }
}

export default new CameraService();
