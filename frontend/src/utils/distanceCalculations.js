/**
 * Distance Calculation Utilities
 * 
 * Matematiska funktioner för avståndsberäkning i 2D och 3D
 */

/**
 * Pythagoras sats i 3D
 * Beräkna euklidiskt avstånd mellan två punkter i 3D-rymd
 * 
 * @param {Object} pointA - Första punkten {x, y, z}
 * @param {Object} pointB - Andra punkten {x, y, z}
 * @returns {number} Avstånd i samma enhet som input
 */
export function calculateDistance3D(pointA, pointB) {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  const dz = pointA.z - pointB.z;
  
  return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

/**
 * Pythagoras sats i 2D
 * Beräkna avstånd mellan två punkter i 2D-plan
 * 
 * @param {Object} pointA - Första punkten {x, y}
 * @param {Object} pointB - Andra punkten {x, y}
 * @returns {number} Avstånd i pixlar
 */
export function calculateDistance2D(pointA, pointB) {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  
  return Math.sqrt(dx*dx + dy*dy);
}

/**
 * Omvandling pixels → centimeter
 * Konverterar pixelavstånd till verkligt avstånd i centimeter
 * 
 * @param {number} pixels - Avstånd i pixlar
 * @param {number} cameraDistance - Avstånd från kamera till objekt (meter)
 * @param {number} focalLength - Kamerans brännvidd (mm)
 * @returns {number} Avstånd i centimeter
 */
export function pixelsToCentimeters(pixels, cameraDistance, focalLength) {
  const sensorWidth = 4.8; // typisk mobilsensor (mm)
  const imageWidth = 1080; // pixels
  
  const cmPerPixel = (sensorWidth * cameraDistance * 100) / (focalLength * imageWidth);
  return pixels * cmPerPixel;
}

/**
 * Omvandling pixels → meter
 * Konverterar pixelavstånd till verkligt avstånd i meter
 * 
 * @param {number} pixels - Avstånd i pixlar
 * @param {number} cameraDistance - Avstånd från kamera till objekt (meter)
 * @param {number} focalLength - Kamerans brännvidd (mm)
 * @returns {number} Avstånd i meter
 */
export function pixelsToMeters(pixels, cameraDistance, focalLength) {
  const cm = pixelsToCentimeters(pixels, cameraDistance, focalLength);
  return cm / 100;
}

/**
 * Beräkna avstånd med kända objektstorlekar
 * Använder referensobjekt (cochonnet eller boule) för skalning
 * 
 * @param {number} pixelDistance - Avstånd i pixlar
 * @param {number} referencePixelSize - Referensobjektets storlek i pixlar
 * @param {number} referenceRealSize - Referensobjektets verkliga storlek (meter)
 * @returns {number} Avstånd i meter
 */
export function calculateDistanceWithReference(pixelDistance, referencePixelSize, referenceRealSize) {
  const scale = referenceRealSize / referencePixelSize;
  return pixelDistance * scale;
}

/**
 * Beräkna djup från disparitet (stereo vision)
 * 
 * @param {number} disparity - Disparitet mellan vänster och höger bild (pixlar)
 * @param {number} baseline - Avstånd mellan kameror (meter)
 * @param {number} focalLength - Brännvidd (pixlar)
 * @returns {number} Djup i meter
 */
export function calculateDepthFromDisparity(disparity, baseline, focalLength) {
  if (disparity === 0) return Infinity;
  return (baseline * focalLength) / disparity;
}

/**
 * Konvertera pixel-koordinater till 3D-koordinater
 * 
 * @param {Object} pixelCoords - Pixel-koordinater {x, y}
 * @param {number} depth - Djup i meter
 * @param {Object} cameraParams - Kameraparametrar {fx, fy, cx, cy}
 * @returns {Object} 3D-koordinater {x, y, z}
 */
export function pixelTo3D(pixelCoords, depth, cameraParams) {
  const { fx, fy, cx, cy } = cameraParams;
  
  const x = (pixelCoords.x - cx) * depth / fx;
  const y = (pixelCoords.y - cy) * depth / fy;
  const z = depth;
  
  return { x, y, z };
}

/**
 * Konvertera 3D-koordinater till pixel-koordinater
 * 
 * @param {Object} point3D - 3D-koordinater {x, y, z}
 * @param {Object} cameraParams - Kameraparametrar {fx, fy, cx, cy}
 * @returns {Object} Pixel-koordinater {x, y}
 */
export function point3DToPixel(point3D, cameraParams) {
  const { fx, fy, cx, cy } = cameraParams;
  
  if (point3D.z === 0) return { x: cx, y: cy };
  
  const x = (point3D.x * fx / point3D.z) + cx;
  const y = (point3D.y * fy / point3D.z) + cy;
  
  return { x, y };
}

/**
 * Beräkna vinkel mellan två vektorer
 * 
 * @param {Object} vectorA - Första vektorn {x, y, z}
 * @param {Object} vectorB - Andra vektorn {x, y, z}
 * @returns {number} Vinkel i grader
 */
export function calculateAngleBetweenVectors(vectorA, vectorB) {
  const dotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;
  const magnitudeA = Math.sqrt(vectorA.x**2 + vectorA.y**2 + vectorA.z**2);
  const magnitudeB = Math.sqrt(vectorB.x**2 + vectorB.y**2 + vectorB.z**2);
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  const cosAngle = dotProduct / (magnitudeA * magnitudeB);
  const angleRadians = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
  
  return angleRadians * (180 / Math.PI);
}

/**
 * Beräkna avstånd från kamera till objekt med känd storlek
 * 
 * @param {number} realSize - Objektets verkliga storlek (meter)
 * @param {number} pixelSize - Objektets storlek i pixlar
 * @param {number} focalLength - Kamerans brännvidd (pixlar)
 * @returns {number} Avstånd i meter
 */
export function calculateDistanceFromSize(realSize, pixelSize, focalLength) {
  if (pixelSize === 0) return Infinity;
  return (realSize * focalLength) / pixelSize;
}

/**
 * Beräkna area av triangel (för triangulering)
 * 
 * @param {Object} p1 - Första punkten {x, y}
 * @param {Object} p2 - Andra punkten {x, y}
 * @param {Object} p3 - Tredje punkten {x, y}
 * @returns {number} Area
 */
export function calculateTriangleArea(p1, p2, p3) {
  return Math.abs(
    (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2
  );
}

/**
 * Kontrollera om en punkt är inom ett visst avstånd från en annan
 * 
 * @param {Object} point1 - Första punkten {x, y, z}
 * @param {Object} point2 - Andra punkten {x, y, z}
 * @param {number} threshold - Tröskelvärde
 * @returns {boolean} True om inom tröskelvärde
 */
export function isWithinDistance(point1, point2, threshold) {
  const distance = calculateDistance3D(point1, point2);
  return distance <= threshold;
}

/**
 * Hitta närmaste punkt från en lista
 * 
 * @param {Object} referencePoint - Referenspunkt {x, y, z}
 * @param {Array} points - Lista med punkter
 * @returns {Object} Närmaste punkten och dess avstånd
 */
export function findNearestPoint(referencePoint, points) {
  if (!points || points.length === 0) {
    return null;
  }
  
  let nearestPoint = points[0];
  let minDistance = calculateDistance3D(referencePoint, points[0]);
  
  for (let i = 1; i < points.length; i++) {
    const distance = calculateDistance3D(referencePoint, points[i]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = points[i];
    }
  }
  
  return {
    point: nearestPoint,
    distance: minDistance,
  };
}

/**
 * Sortera punkter efter avstånd från referenspunkt
 * 
 * @param {Object} referencePoint - Referenspunkt {x, y, z}
 * @param {Array} points - Lista med punkter
 * @returns {Array} Sorterad lista med punkter och avstånd
 */
export function sortPointsByDistance(referencePoint, points) {
  return points
    .map(point => ({
      point,
      distance: calculateDistance3D(referencePoint, point),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Exempel på användning
 */
export const examples = {
  // 3D-avstånd mellan två boular
  distance3D: () => {
    const boule1 = { x: 1.0, y: 0.5, z: 0.0 };
    const boule2 = { x: 1.5, y: 0.8, z: 0.0 };
    return calculateDistance3D(boule1, boule2);
  },
  
  // Konvertera pixlar till centimeter
  pixelConversion: () => {
    const pixels = 150;
    const cameraDistance = 2.0; // 2 meter
    const focalLength = 4.0; // 4mm
    return pixelsToCentimeters(pixels, cameraDistance, focalLength);
  },
  
  // Beräkna med referensobjekt (cochonnet)
  withReference: () => {
    const pixelDistance = 200;
    const cochonnetPixelSize = 30;
    const cochonnetRealSize = 0.03; // 30mm
    return calculateDistanceWithReference(pixelDistance, cochonnetPixelSize, cochonnetRealSize);
  },
};

export default {
  calculateDistance3D,
  calculateDistance2D,
  pixelsToCentimeters,
  pixelsToMeters,
  calculateDistanceWithReference,
  calculateDepthFromDisparity,
  pixelTo3D,
  point3DToPixel,
  calculateAngleBetweenVectors,
  calculateDistanceFromSize,
  calculateTriangleArea,
  isWithinDistance,
  findNearestPoint,
  sortPointsByDistance,
  examples,
};
