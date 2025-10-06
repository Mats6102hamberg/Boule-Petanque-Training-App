/**
 * Tjänst för att beräkna avstånd mellan boular och cochonnet
 * Använder datorseende och triangulering
 */

class DistanceCalculator {
  constructor() {
    this.calibrationData = null;
  }

  /**
   * Kalibrerar kameran för noggranna mätningar
   */
  async calibrate(calibrationImages) {
    // I produktion:
    // 1. Använd kända avstånd för kalibrering
    // 2. Beräkna kameramatris
    // 3. Hitta distorsionskoefficienter
    
    this.calibrationData = {
      focalLength: 1000, // pixels
      principalPoint: { x: 960, y: 540 },
      distortion: [0, 0, 0, 0, 0],
      sensorSize: { width: 0.0064, height: 0.0036 }, // meters
    };
    
    console.log('Camera calibrated');
    return this.calibrationData;
  }

  /**
   * Beräkna avstånd från bild
   */
  async calculate(imageUrl) {
    try {
      // 1. Ladda och preprocessa bild
      const image = await this.loadImage(imageUrl);
      
      // 2. Detektera objekt
      const objects = await this.detectObjects(image);
      
      // 3. Beräkna avstånd med triangulering
      const distances = this.triangulate(objects);
      
      return {
        toCochonnet: distances.toCochonnet,
        betweenBoules: distances.betweenBoules,
        ranking: distances.ranking,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Distance calculation error:', error);
      throw error;
    }
  }

  /**
   * Ladda bild från URL
   */
  async loadImage(imageUrl) {
    // I produktion: ladda faktisk bild
    return {
      width: 1920,
      height: 1080,
      data: null,
    };
  }

  /**
   * Detektera boular och cochonnet i bilden
   */
  async detectObjects(image) {
    // I produktion: använd ML-modell för objektdetektering
    // Mock-data för demonstration
    return {
      cochonnet: {
        position: { x: 960, y: 540 },
        radius: 15,
        confidence: 0.95,
      },
      boules: [
        {
          id: 1,
          position: { x: 950, y: 550 },
          radius: 35,
          confidence: 0.92,
          team: 'A',
        },
        {
          id: 2,
          position: { x: 980, y: 530 },
          radius: 35,
          confidence: 0.89,
          team: 'B',
        },
        {
          id: 3,
          position: { x: 940, y: 560 },
          radius: 35,
          confidence: 0.91,
          team: 'A',
        },
      ],
    };
  }

  /**
   * Triangulera för att beräkna verkliga avstånd
   * Grundprincip: cameraPosition → Object1 → Object2
   */
  triangulate(objects) {
    const { cochonnet, boules } = objects;
    
    // Beräkna avstånd från varje boule till cochonnet
    const distances = boules.map((boule) => {
      // Pixelavstånd
      const pixelDistance = this.calculatePixelDistance(
        cochonnet.position,
        boule.position
      );
      
      // Konvertera till verkligt avstånd
      const realDistance = this.pixelsToMeters(
        pixelDistance,
        cochonnet.radius,
        boule.radius
      );
      
      return {
        bouleId: boule.id,
        team: boule.team,
        distance: realDistance,
      };
    });
    
    // Sortera efter avstånd
    const ranking = distances.sort((a, b) => a.distance - b.distance);
    
    // Beräkna avstånd mellan boular
    const betweenBoules = [];
    for (let i = 0; i < boules.length; i++) {
      for (let j = i + 1; j < boules.length; j++) {
        const pixelDist = this.calculatePixelDistance(
          boules[i].position,
          boules[j].position
        );
        const realDist = this.pixelsToMeters(
          pixelDist,
          boules[i].radius,
          boules[j].radius
        );
        
        betweenBoules.push({
          boule1: boules[i].id,
          boule2: boules[j].id,
          distance: realDist,
        });
      }
    }
    
    return {
      toCochonnet: ranking[0].distance,
      betweenBoules,
      ranking,
    };
  }

  /**
   * Beräkna pixelavstånd mellan två punkter
   */
  calculatePixelDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Konvertera pixelavstånd till meter
   * Använder objektstorlek som referens
   */
  pixelsToMeters(pixelDistance, radius1, radius2) {
    // Kända storleker:
    // - Cochonnet: 25-35mm diameter
    // - Boule: 70.5-80mm diameter
    
    const cochonnetDiameter = 0.03; // 30mm i meter
    const bouleDiameter = 0.0755; // 75.5mm i meter
    
    // Använd objektstorlek för skalning
    const averageRadius = (radius1 + radius2) / 2;
    const pixelsPerMeter = averageRadius / (bouleDiameter / 2);
    
    return pixelDistance / pixelsPerMeter;
  }

  /**
   * Använd AR-data för mer noggrann mätning
   * (ARKit på iOS, ARCore på Android)
   */
  calculateWithAR(arData) {
    // ARKit/ARCore ger direkt djupinformation
    return {
      distance: arData.distance,
      confidence: arData.confidence,
      method: 'AR',
    };
  }

  /**
   * Använd LiDAR för exakta mätningar (nyare iPhones/iPads)
   */
  calculateWithLiDAR(lidarData) {
    // LiDAR ger mycket noggrann djupdata
    return {
      distance: lidarData.distance,
      accuracy: lidarData.accuracy,
      method: 'LiDAR',
    };
  }

  /**
   * Beräkna poäng baserat på avstånd
   */
  calculateScore(distances) {
    const ranking = distances.ranking;
    const closestTeam = ranking[0].team;
    
    let score = 0;
    for (const entry of ranking) {
      if (entry.team === closestTeam) {
        score++;
      } else {
        break; // Stoppa när vi når andra laget
      }
    }
    
    return {
      team: closestTeam,
      points: score,
      details: ranking,
    };
  }
}

module.exports = new DistanceCalculator();
