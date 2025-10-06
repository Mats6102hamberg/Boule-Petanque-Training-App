# 🚀 Quick Start Guide - Boule Pétanque Training App

## 📋 Översikt

Detta projekt implementerar en komplett träningsapp för pétanque med:

- **AI-driven kastteknikanalys**
- **Realtidsavståndsberäkning med triangulering**
- **Machine Learning för objektdetektering**
- **ARKit/ARCore/LiDAR-integration**

---

## 🎯 Kärnteknologier

### Triangulering - Grundprincip

```
cameraPosition → Object1 → Object2
         ↑          ↑         ↑
      Kameran   Boulen   Cochonnet
```

### Tekniker som används:
- **ARKit** (iOS) - för djupdata och AR-funktioner
- **ARCore** (Android) - för djupdata och AR-funktioner
- **Stereo Vision** (med två kameror) - för 3D-rekonstruktion
- **LiDAR** (på nyare iPhone/iPad) - för exakta mätningar

---

## 🛠️ Installation

### 1. Klona projektet

```bash
git clone https://github.com/Mats6102hamberg/Boule-Petanque-Training-App.git
cd Boule-Petanque-Training-App
```

### 2. Installera Frontend (React Native)

```bash
cd frontend
npm install

# För iOS (endast macOS)
cd ios && pod install && cd ..

# Starta Expo
npm start
```

### 3. Installera Backend (Node.js)

```bash
cd backend
npm install

# Skapa .env fil
cp .env.example .env
# Redigera .env med dina inställningar

# Starta server
npm run dev
```

### 4. Installera AI/ML (Python)

```bash
cd ai-ml
python -m venv venv
source venv/bin/activate  # På Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 📱 Huvudfunktioner

### 1. Camera Service med Frame Processor

```javascript
// frontend/src/services/camera/cameraService.js
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
```

### 2. ML-baserad Objektdetektering

```python
# ai-ml/models/object_detection_ml.py
def detect_objects(image):
    # 1. Bildförbehandling
    processed_image = preprocess(image)
    
    # 2. Objektdetektering
    objects = ml_model.detect(processed_image)
    
    # 3. Filtrera boular vs cochonnet
    boules = filter_boules(objects)
    cochonnet = find_cochonnet(objects)
    
    return boules, cochonnet
```

### 3. Triangulering för Avståndsberäkning

```python
# ai-ml/models/distance_calculation/triangulation.py
class Triangulator:
    def calculate_distance_3d(self, point1_2d, point2_2d, depth1, depth2):
        """
        Beräkna 3D-avstånd med djupinformation från ARKit/ARCore/LiDAR
        """
        point1_3d = self.pixel_to_3d(point1_2d, depth1)
        point2_3d = self.pixel_to_3d(point2_2d, depth2)
        
        distance = np.linalg.norm(point1_3d - point2_3d)
        return distance
```

---

## 🎨 Projektstruktur

```
boule-app/
├── 📱 frontend/              # React Native app
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Button, Header, LoadingSpinner, StatsCard
│   │   │   ├── training/    # CameraView, ThrowAnalyzer, PracticeSession
│   │   │   ├── game/        # Scoreboard, VirtualBoule, GameSetup
│   │   │   └── camera/      # BouleCamera (med triangulering)
│   │   ├── services/
│   │   │   ├── camera/      # cameraService.js (frame processor)
│   │   │   └── api/         # API-tjänster
│   │   └── store/           # Redux state management
│   └── package.json
│
├── 🖥️ backend/               # Node.js API
│   ├── src/
│   │   ├── controllers/     # trainingController, authController
│   │   ├── models/          # User, TrainingSession, Game, Achievement
│   │   ├── routes/          # API routes
│   │   ├── services/
│   │   │   └── ai/          # throwAnalyzer, distanceCalculator
│   │   └── middleware/      # auth, validation, errorHandler
│   └── server.js
│
├── 🤖 ai-ml/                 # Python ML
│   ├── models/
│   │   ├── throw_analysis/  # train_model.py (TensorFlow/Keras)
│   │   ├── distance_calculation/
│   │   │   ├── object_detection.py  # YOLO/SSD objektdetektering
│   │   │   └── triangulation.py     # Triangulering
│   │   └── object_detection_ml.py   # ML-modell för detektering
│   └── requirements.txt
│
└── 📚 docs/                  # Dokumentation
    ├── architecture.md       # Systemarkitektur
    ├── setup-guide.md        # Detaljerad setup
    ├── triangulation-guide.md # Triangulering & tekniker
    └── implementation-examples.md # Kodexempel
```

---

## 🔑 Viktiga Filer

### Frontend

| Fil | Beskrivning |
|-----|-------------|
| `frontend/src/services/camera/cameraService.js` | Camera service med frame processor och triangulering |
| `frontend/src/components/camera/BouleCamera.js` | Komplett kamerakomponent med realtidsanalys |
| `frontend/src/components/training/ThrowAnalyzer.js` | AI-analys av kastteknik |
| `frontend/src/components/training/PracticeSession.js` | Träningspass-hantering |

### Backend

| Fil | Beskrivning |
|-----|-------------|
| `backend/src/controllers/trainingController.js` | API för träningssessioner |
| `backend/src/services/ai/throwAnalyzer.js` | AI-tjänst för kastanalys |
| `backend/src/services/ai/distanceCalculator.js` | Avståndsberäkning |
| `backend/src/models/TrainingSession.js` | MongoDB-modell för sessioner |

### AI/ML

| Fil | Beskrivning |
|-----|-------------|
| `ai-ml/models/object_detection_ml.py` | ML-modell för objektdetektering |
| `ai-ml/models/distance_calculation/triangulation.py` | Triangulering och avståndsberäkning |
| `ai-ml/models/throw_analysis/train_model.py` | Träna ML-modell för kastteknik |
| `ai-ml/utils/image_processing.py` | Bildbehandlingsverktyg |

---

## 🎯 Snabbstart - Kör Appen

### Med Docker (rekommenderat)

```bash
# Starta alla services
docker-compose up

# Frontend: http://localhost:19000 (Expo)
# Backend: http://localhost:3000
# AI/ML: http://localhost:5000
```

### Manuellt

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - AI/ML (optional)
cd ai-ml
source venv/bin/activate
python app.py
```

---

## 📖 Dokumentation

### Grundläggande

- [README.md](./README.md) - Projektöversikt
- [Setup Guide](./docs/setup-guide.md) - Detaljerad installation
- [Architecture](./docs/architecture.md) - Systemarkitektur

### Teknisk

- [Triangulation Guide](./docs/triangulation-guide.md) - Triangulering och tekniker
- [Implementation Examples](./docs/implementation-examples.md) - Kodexempel
- [Database Schemas](./database/schemas.md) - Databasstruktur

---

## 🧪 Testning

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test

# AI/ML
cd ai-ml
pytest
```

---

## 🚀 Deployment

### Frontend (Expo)

```bash
cd frontend
eas build --platform ios
eas build --platform android
```

### Backend (Docker)

```bash
cd backend
docker build -t boule-backend .
docker run -p 3000:3000 boule-backend
```

---

## 🔧 Konfiguration

### Environment Variables

**Frontend (.env):**
```env
API_URL=http://localhost:3000/api
CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**Backend (.env):**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/boule-petanque
JWT_SECRET=your_secret_key
```

---

## 💡 Tips & Tricks

### Förbättra Kamerakvalitet

```javascript
// Använd högsta kvalitet för bättre detektering
const photo = await camera.takePhoto({
  qualityPrioritization: 'quality',
  enableAutoStabilization: true,
});
```

### Optimera Frame Processing

```javascript
// Kör inte varje frame för bättre performance
let frameCount = 0;
const PROCESS_EVERY_N_FRAMES = 3;

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  frameCount++;
  if (frameCount % PROCESS_EVERY_N_FRAMES !== 0) return;
  
  // Process frame...
}, []);
```

### Förbättra ML-noggrannhet

```python
# Använd data augmentation vid träning
data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
])
```

---

## 🐛 Felsökning

### Problem: Kameran startar inte

```bash
# iOS
cd ios && pod install && cd ..
# Kontrollera Info.plist för camera permissions

# Android
# Kontrollera AndroidManifest.xml för permissions
```

### Problem: ML-modellen hittas inte

```bash
# Kontrollera att modellen är tränad
cd ai-ml
python models/throw_analysis/train_model.py
```

### Problem: Backend ansluter inte till MongoDB

```bash
# Starta MongoDB
brew services start mongodb-community

# Eller använd Docker
docker run -d -p 27017:27017 mongo:6.0
```

---

## 📞 Support

- **GitHub**: [Boule-Petanque-Training-App](https://github.com/Mats6102hamberg/Boule-Petanque-Training-App)
- **Issues**: [Report bugs](https://github.com/Mats6102hamberg/Boule-Petanque-Training-App/issues)
- **Email**: mats6102hamberg@gmail.com

---

## 🎉 Nästa Steg

1. ✅ Installera alla dependencies
2. ✅ Konfigurera environment variables
3. ✅ Starta utvecklingsservrar
4. 📱 Testa appen på fysisk enhet
5. 🤖 Träna ML-modeller med egen data
6. 🚀 Deploy till produktion

**Lycka till med utvecklingen!** 🎯
