/**
 * Camera Calibration Utilities
 * 
 * Kalibrerar kameran för noggranna avståndsmätningar
 * genom att använda objekt med känd storlek/avstånd
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CALIBRATION_KEY = 'camera_calibration_data';

/**
 * Lösning - Kalibrering
 * Användaren fotograferar ett objekt med känt avstånd/storlek
 * för att beräkna scale factor
 */
export const calibrateCamera = async (knownDistance, knownSize) => {
  try {
    // Användar får fotografera ett objekt med känt avstånd/storlek
    const pixelSize = await measureInPixels(knownSize);
    
    if (!pixelSize || pixelSize === 0) {
      throw new Error('Kunde inte mäta pixelstorlek');
    }
    
    // Beräkna scale factor
    const scaleFactor = knownSize / pixelSize;
    
    // Spara kalibreringen
    const calibrationData = {
      scaleFactor,
      knownDistance,
      knownSize,
      pixelSize,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem(CALIBRATION_KEY, JSON.stringify(calibrationData));
    
    console.log('✅ Kamera kalibrerad:', calibrationData);
    
    return scaleFactor;
  } catch (error) {
    console.error('❌ Kalibreringsfel:', error);
    throw error;
  }
};

/**
 * Mät ett objekt i pixlar
 */
export const measureInPixels = async (knownSize) => {
  // Detta skulle implementeras med faktisk bildanalys
  // För nu returnerar vi en placeholder
  
  // I produktion:
  // 1. Ta foto av objekt med känd storlek
  // 2. Detektera objektet i bilden
  // 3. Mät dess storlek i pixlar
  // 4. Returnera pixelstorleken
  
  return new Promise((resolve) => {
    // Simulera mätning
    setTimeout(() => {
      // Placeholder: antag att objektet är 100 pixlar
      resolve(100);
    }, 1000);
  });
};

/**
 * Hämta sparad kalibrering
 */
export const getCalibration = async () => {
  try {
    const data = await AsyncStorage.getItem(CALIBRATION_KEY);
    
    if (!data) {
      return null;
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Kunde inte hämta kalibrering:', error);
    return null;
  }
};

/**
 * Kontrollera om kameran är kalibrerad
 */
export const isCalibrated = async () => {
  const calibration = await getCalibration();
  return calibration !== null;
};

/**
 * Rensa kalibrering
 */
export const clearCalibration = async () => {
  try {
    await AsyncStorage.removeItem(CALIBRATION_KEY);
    console.log('✅ Kalibrering rensad');
  } catch (error) {
    console.error('❌ Kunde inte rensa kalibrering:', error);
  }
};

/**
 * Konvertera pixlar till meter med kalibrering
 */
export const pixelsToMeters = async (pixels) => {
  const calibration = await getCalibration();
  
  if (!calibration) {
    // Om inte kalibrerad, använd approximation
    console.warn('⚠️ Kamera ej kalibrerad, använder approximation');
    return pixels * 0.01; // Rough estimate
  }
  
  return pixels * calibration.scaleFactor;
};

/**
 * Konvertera meter till pixlar med kalibrering
 */
export const metersToPixels = async (meters) => {
  const calibration = await getCalibration();
  
  if (!calibration) {
    console.warn('⚠️ Kamera ej kalibrerad, använder approximation');
    return meters * 100; // Rough estimate
  }
  
  return meters / calibration.scaleFactor;
};

/**
 * Kalibrera med referensobjekt (cochonnet eller boule)
 */
export const calibrateWithReferenceObject = async (objectType = 'cochonnet') => {
  // Kända storleker
  const KNOWN_SIZES = {
    cochonnet: 0.03,  // 30mm i meter
    boule: 0.0755,    // 75.5mm i meter
  };
  
  const knownSize = KNOWN_SIZES[objectType];
  
  if (!knownSize) {
    throw new Error(`Okänd objekttyp: ${objectType}`);
  }
  
  console.log(`📏 Kalibrerar med ${objectType} (${knownSize * 1000}mm)`);
  
  // Mät objektet i bilden
  const pixelSize = await measureInPixels(knownSize);
  
  // Beräkna scale factor
  const scaleFactor = knownSize / pixelSize;
  
  // Spara kalibrering
  const calibrationData = {
    scaleFactor,
    referenceObject: objectType,
    knownSize,
    pixelSize,
    timestamp: Date.now(),
  };
  
  await AsyncStorage.setItem(CALIBRATION_KEY, JSON.stringify(calibrationData));
  
  console.log('✅ Kalibrering klar:', calibrationData);
  
  return calibrationData;
};

/**
 * Validera kalibrering
 */
export const validateCalibration = async (testDistance) => {
  const calibration = await getCalibration();
  
  if (!calibration) {
    return {
      valid: false,
      error: 'Ingen kalibrering hittades',
    };
  }
  
  // Kontrollera ålder på kalibrering
  const age = Date.now() - calibration.timestamp;
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dagar
  
  if (age > maxAge) {
    return {
      valid: false,
      error: 'Kalibreringen är för gammal',
      age: Math.floor(age / (24 * 60 * 60 * 1000)) + ' dagar',
    };
  }
  
  // Testa med känt avstånd om tillgängligt
  if (testDistance) {
    const measuredPixels = await measureInPixels(testDistance);
    const calculatedDistance = measuredPixels * calibration.scaleFactor;
    const error = Math.abs(calculatedDistance - testDistance);
    const errorPercent = (error / testDistance) * 100;
    
    return {
      valid: errorPercent < 10, // Acceptera <10% fel
      error: errorPercent,
      measured: calculatedDistance,
      expected: testDistance,
    };
  }
  
  return {
    valid: true,
    calibration,
  };
};

/**
 * Automatisk kalibrering med flera mätningar
 */
export const autoCalibrate = async (measurements) => {
  /**
   * measurements: Array av { knownSize, measuredPixels }
   */
  
  if (!measurements || measurements.length === 0) {
    throw new Error('Inga mätningar tillgängliga');
  }
  
  // Beräkna scale factor för varje mätning
  const scaleFactors = measurements.map(m => m.knownSize / m.measuredPixels);
  
  // Ta medelvärde
  const avgScaleFactor = scaleFactors.reduce((a, b) => a + b, 0) / scaleFactors.length;
  
  // Beräkna standardavvikelse
  const variance = scaleFactors.reduce((sum, sf) => {
    return sum + Math.pow(sf - avgScaleFactor, 2);
  }, 0) / scaleFactors.length;
  
  const stdDev = Math.sqrt(variance);
  
  const calibrationData = {
    scaleFactor: avgScaleFactor,
    standardDeviation: stdDev,
    measurements: measurements.length,
    confidence: 1 - (stdDev / avgScaleFactor), // 0-1
    timestamp: Date.now(),
  };
  
  await AsyncStorage.setItem(CALIBRATION_KEY, JSON.stringify(calibrationData));
  
  console.log('✅ Auto-kalibrering klar:', calibrationData);
  
  return calibrationData;
};

export default {
  calibrateCamera,
  measureInPixels,
  getCalibration,
  isCalibrated,
  clearCalibration,
  pixelsToMeters,
  metersToPixels,
  calibrateWithReferenceObject,
  validateCalibration,
  autoCalibrate,
};
