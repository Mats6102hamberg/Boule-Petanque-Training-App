/**
 * AI-tjänst för att analysera kastteknik
 * Använder machine learning för att utvärdera:
 * - Kastvinkel
 * - Hastighet
 * - Rotation
 * - Teknik (pointing, shooting, rolling)
 */

class ThrowAnalyzer {
  constructor() {
    this.model = null;
    this.isInitialized = false;
  }

  /**
   * Initialisera ML-modellen
   * I produktion skulle detta ladda en TensorFlow/PyTorch-modell
   */
  async initialize() {
    try {
      // Ladda tränad modell
      // this.model = await loadModel('path/to/model');
      this.isInitialized = true;
      console.log('ThrowAnalyzer initialized');
    } catch (error) {
      console.error('Failed to initialize ThrowAnalyzer:', error);
      throw error;
    }
  }

  /**
   * Analysera ett kast från bild eller video
   */
  async analyze({ imageUrl, videoUrl }) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      let data;
      
      if (videoUrl) {
        data = await this.analyzeVideo(videoUrl);
      } else if (imageUrl) {
        data = await this.analyzeImage(imageUrl);
      } else {
        throw new Error('No image or video provided');
      }

      return {
        technique: data.technique,
        angle: data.angle,
        speed: data.speed,
        rotation: data.rotation,
        accuracy: data.accuracy,
        quality: data.quality,
        feedback: this.generateFeedback(data),
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }

  /**
   * Analysera video för att extrahera kastteknik
   */
  async analyzeVideo(videoUrl) {
    // I produktion:
    // 1. Ladda ner video
    // 2. Extrahera frames
    // 3. Detektera nyckelpositioner (hand, arm, boule)
    // 4. Beräkna rörelsebanor
    // 5. Klassificera teknik
    
    // Mock-data för demonstration
    return {
      technique: this.detectTechnique(),
      angle: this.calculateAngle(),
      speed: this.calculateSpeed(),
      rotation: this.detectRotation(),
      accuracy: this.calculateAccuracy(),
      quality: this.assessQuality(),
    };
  }

  /**
   * Analysera stillbild
   */
  async analyzeImage(imageUrl) {
    // I produktion:
    // 1. Ladda ner bild
    // 2. Preprocessa (resize, normalize)
    // 3. Kör genom ML-modell
    // 4. Extrahera features
    
    // Mock-data för demonstration
    return {
      technique: 'pointing',
      angle: 25 + Math.random() * 20,
      speed: 3 + Math.random() * 5,
      rotation: 'backspin',
      accuracy: 60 + Math.random() * 35,
      quality: 0.7 + Math.random() * 0.25,
    };
  }

  /**
   * Detektera kastteknik
   */
  detectTechnique() {
    const techniques = ['pointing', 'shooting', 'rolling'];
    return techniques[Math.floor(Math.random() * techniques.length)];
  }

  /**
   * Beräkna kastvinkel
   */
  calculateAngle() {
    // Optimal vinkel är 20-35 grader
    return 15 + Math.random() * 30;
  }

  /**
   * Beräkna kasthastighet
   */
  calculateSpeed() {
    // Typisk hastighet 3-8 m/s
    return 3 + Math.random() * 5;
  }

  /**
   * Detektera rotation
   */
  detectRotation() {
    const rotations = ['backspin', 'topspin', 'sidespin', 'none'];
    return rotations[Math.floor(Math.random() * rotations.length)];
  }

  /**
   * Beräkna noggrannhet
   */
  calculateAccuracy() {
    return 50 + Math.random() * 45;
  }

  /**
   * Bedöm övergripande kvalitet
   */
  assessQuality() {
    return 0.5 + Math.random() * 0.45;
  }

  /**
   * Generera feedback baserat på analys
   */
  generateFeedback(data) {
    const feedback = [];

    // Feedback om vinkel
    if (data.angle < 20) {
      feedback.push({
        type: 'warning',
        message: 'Kastvinkeln är för låg. Försök höja armen något.',
        priority: 'high',
      });
    } else if (data.angle > 40) {
      feedback.push({
        type: 'warning',
        message: 'Kastvinkeln är för hög. Sänk armen för bättre kontroll.',
        priority: 'high',
      });
    } else {
      feedback.push({
        type: 'success',
        message: 'Bra kastvinkel!',
        priority: 'low',
      });
    }

    // Feedback om hastighet
    if (data.speed < 3) {
      feedback.push({
        type: 'info',
        message: 'Öka hastigheten något för längre kast.',
        priority: 'medium',
      });
    } else if (data.speed > 7) {
      feedback.push({
        type: 'warning',
        message: 'Kasta lite mjukare för bättre precision.',
        priority: 'high',
      });
    }

    // Feedback om teknik
    if (data.technique === 'pointing' && data.accuracy > 80) {
      feedback.push({
        type: 'success',
        message: 'Utmärkt pointing-teknik!',
        priority: 'low',
      });
    }

    // Feedback om rotation
    if (data.rotation === 'backspin') {
      feedback.push({
        type: 'success',
        message: 'Bra backspin för kontrollerad landning.',
        priority: 'low',
      });
    }

    return feedback;
  }

  /**
   * Jämför två kast för att visa förbättring
   */
  compareThrows(throw1, throw2) {
    return {
      angleImprovement: throw2.angle - throw1.angle,
      speedImprovement: throw2.speed - throw1.speed,
      accuracyImprovement: throw2.accuracy - throw1.accuracy,
      overallImprovement: throw2.quality - throw1.quality,
    };
  }
}

module.exports = new ThrowAnalyzer();
