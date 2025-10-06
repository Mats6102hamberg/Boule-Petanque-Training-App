# 🎯 Boule Pétanque Training App

En modern mobilapplikation för pétanque-träning med AI-driven analys, realtidsavståndsberäkning och sociala funktioner.

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.72-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb)

## ✨ Funktioner

### 🎥 AI-driven Kastteknikanalys
- Realtidsanalys av kast med kamera
- Detektering av kastvinkel, hastighet och rotation
- Personlig feedback och förbättringstips
- Video-replay med overlay-analys

### 📏 Precis Avståndsberäkning
- Triangulering med datorseende
- ARKit/ARCore-integration för djupdata
- LiDAR-support på nyare enheter
- Automatisk poängberäkning

### 🏋️ Träningsprogram
- Strukturerade träningspass
- Olika övningar (pointing, shooting, rolling)
- Progressionsspårning
- Personliga mål och milstolpar

### 🎮 Spel & Tävlingar
- Digitalt resultatbräde
- Multiplayer-stöd
- Turnering-system
- Statistik och leaderboards

### 👥 Sociala Funktioner
- Utmana vänner
- Dela träningsresultat
- Globala rankings
- Achievement-system

## 🏗️ Arkitektur

```
📱 Frontend (React Native/Expo)
├── Kameraintegration med Vision Camera
├── Redux för state management
├── React Navigation för routing
└── Reanimated för animationer

🖥️ Backend (Node.js/Express)
├── RESTful API
├── WebSocket för realtid
├── JWT-autentisering
└── MongoDB för datalagring

🤖 AI/ML (Python)
├── TensorFlow för kastteknikanalys
├── OpenCV för objektdetektering
├── Triangulering för avståndsberäkning
└── Flask API för ML-inference
```

## 🚀 Snabbstart

### Förutsättningar
- Node.js 18+
- Python 3.9+
- MongoDB 6.0+
- Expo CLI

### Installation

```bash
# Klona repository
git clone https://github.com/Mats6102hamberg/Boule-Petanque-Training-App.git
cd Boule-Petanque-Training-App

# Installera frontend
cd frontend
npm install
npm start

# Installera backend (nytt terminal-fönster)
cd backend
npm install
npm run dev

# Installera AI/ML (nytt terminal-fönster)
cd ai-ml
python -m venv venv
source venv/bin/activate  # På Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Se [Quick Start Guide](./QUICK_START.md) eller [Setup Guide](./docs/setup-guide.md) för detaljerade instruktioner.

### 🎯 Kärnteknologier

**Triangulering för avståndsberäkning:**
```
cameraPosition → Object1 → Object2
         ↑          ↑         ↑
      Kameran   Boulen   Cochonnet
```

**Tekniker:**
- **ARKit** (iOS) / **ARCore** (Android) - för djupdata
- **Stereo Vision** - för 3D-rekonstruktion
- **LiDAR** - för exakta mätningar (nyare iPhone/iPad)

## 📱 Screenshots

*Kommer snart...*

## 🛠️ Teknologier

### Frontend
- **React Native** - Cross-platform mobilutveckling
- **Expo** - Development platform
- **React Native Vision Camera** - Kameraintegration
- **Redux Toolkit** - State management
- **React Navigation** - Navigation
- **Reanimated** - Animationer

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - NoSQL databas
- **Mongoose** - ODM
- **Socket.io** - Realtidskommunikation
- **JWT** - Autentisering

### AI/ML
- **TensorFlow/Keras** - Deep learning
- **OpenCV** - Computer vision
- **NumPy/SciPy** - Numerical computing
- **Flask** - API framework

## 📊 Projektstruktur

```
boule-app/
├── frontend/               # React Native app
│   ├── src/
│   │   ├── components/    # UI-komponenter
│   │   ├── screens/       # Skärmar
│   │   ├── services/      # API & kamera
│   │   ├── navigation/    # Navigation
│   │   └── store/         # Redux store
│   └── package.json
│
├── backend/               # Node.js API
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Express middleware
│   └── server.js
│
├── ai-ml/                 # Python ML
│   ├── models/            # ML-modeller
│   ├── utils/             # Hjälpfunktioner
│   └── requirements.txt
│
└── docs/                  # Dokumentation
    ├── architecture.md
    ├── setup-guide.md
    └── api-docs.md
```

## 🧪 Testing

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

## 📖 Dokumentation

### Grundläggande
- [Quick Start Guide](./QUICK_START.md) - Snabbstart och översikt
- [Setup Guide](./docs/setup-guide.md) - Detaljerad installation
- [Arkitektur](./docs/architecture.md) - Systemarkitektur
- [Tech Stack](./docs/tech-stack.md) - Teknologier och verktyg

### Teknisk
- [Triangulation Guide](./docs/triangulation-guide.md) - Triangulering och tekniker
- [Implementation Examples](./docs/implementation-examples.md) - Kodexempel
- [Database Schemas](./database/schemas.md) - Databasstruktur

## 🤝 Bidra

Vi välkomnar bidrag! 

1. Fork projektet från [GitHub](https://github.com/Mats6102hamberg/Boule-Petanque-Training-App)
2. Skapa din feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dina ändringar (`git commit -m 'Add some AmazingFeature'`)
4. Push till branchen (`git push origin feature/AmazingFeature`)
5. Öppna en Pull Request

## 📝 Licens

Detta projekt är licensierat under MIT License - se [LICENSE](./LICENSE) för detaljer.

## 👥 Team

- **Mats Hamberg** - *Initial work* - [GitHub](https://github.com/Mats6102hamberg)

## 🙏 Acknowledgments

- Inspiration från pétanque-communityn
- TensorFlow och OpenCV communities
- React Native community

## 📞 Kontakt

- GitHub: [Boule Pétanque Training App](https://github.com/Mats6102hamberg/Boule-Petanque-Training-App)
- Issues: [Report bugs or request features](https://github.com/Mats6102hamberg/Boule-Petanque-Training-App/issues)
- Email: mats6102hamberg@gmail.com

---

**Gjort med ❤️ för pétanque-spelare världen över** 🎯
