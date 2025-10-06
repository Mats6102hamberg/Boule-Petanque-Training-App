# Boule Pétanque Training App - Arkitektur

## Översikt

Boule Pétanque Training App är en fullstack mobilapplikation som kombinerar React Native, Node.js, och AI/ML för att skapa en komplett träningsplattform för pétanque-spelare.

## Systemarkitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React Native)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Camera  │  │ Training │  │   Game   │  │  Social  │   │
│  │  Service │  │  Screens │  │  Screens │  │  Screens │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │              │          │
│       └─────────────┴──────────────┴──────────────┘          │
│                         │                                     │
└─────────────────────────┼─────────────────────────────────────┘
                          │
                    REST API / WebSocket
                          │
┌─────────────────────────┼─────────────────────────────────────┐
│                    Backend (Node.js/Express)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Training │  │   Game   │  │  Social  │   │
│  │Controller│  │Controller│  │Controller│  │Controller│   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │              │          │
│       └─────────────┴──────────────┴──────────────┘          │
│                         │                                     │
└─────────────────────────┼─────────────────────────────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
        ┌───────────┴─┐     ┌───┴──────────┐
        │   MongoDB   │     │  AI/ML API   │
        │  (Database) │     │   (Python)   │
        └─────────────┘     └──────────────┘
```

## Komponenter

### 1. Frontend (React Native/Expo)

**Ansvar:**
- Användargränssnitt
- Kameraintegration
- Realtidsanalys av kast
- Offline-funktionalitet
- Push-notifikationer

**Teknologier:**
- React Native 0.72
- Expo SDK 49
- React Navigation
- Redux Toolkit
- React Native Vision Camera
- React Native Reanimated

**Huvudkomponenter:**
- `CameraView`: Kameraintegration med realtidsanalys
- `ThrowAnalyzer`: Visar AI-analys av kast
- `PracticeSession`: Hanterar träningspass
- `Scoreboard`: Visar spelresultat

### 2. Backend (Node.js/Express)

**Ansvar:**
- API-endpoints
- Autentisering & auktorisering
- Databasoperationer
- AI/ML-integration
- Filuppladdning (bilder/videos)
- Realtidskommunikation (WebSocket)

**Teknologier:**
- Node.js 18+
- Express 4
- MongoDB med Mongoose
- JWT för autentisering
- Socket.io för realtid
- Cloudinary för medialagring

**API-endpoints:**
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/training/sessions
POST   /api/training/analyze
GET    /api/games/:id
POST   /api/social/challenge
```

### 3. AI/ML (Python)

**Ansvar:**
- Kastteknikanalys
- Objektdetektering (boular & cochonnet)
- Avståndsberäkning
- Bildbehandling

**Teknologier:**
- TensorFlow/Keras
- OpenCV
- NumPy/SciPy
- Flask (API)

**Modeller:**
- **Throw Analysis Model**: CNN för kastteknikklassificering
- **Object Detection Model**: YOLO/SSD för boule-detektering
- **Distance Calculator**: Triangulering med datorseende

## Dataflöde

### Träningspass-flöde

```
1. Användare startar träningspass
   ↓
2. Kamera aktiveras med realtidsanalys
   ↓
3. Användare kastar boule
   ↓
4. Bild/video fångas
   ↓
5. Skickas till backend
   ↓
6. Backend anropar AI/ML-tjänst
   ↓
7. AI analyserar kast och beräknar avstånd
   ↓
8. Resultat sparas i databas
   ↓
9. Feedback visas för användare
   ↓
10. Statistik uppdateras
```

## Databas Schema

### User
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  stats: {
    accuracy: Number,
    sessionsCompleted: Number,
    bestScore: Number
  },
  achievements: [Achievement],
  friends: [UserID]
}
```

### TrainingSession
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  exercises: [{
    type: String,
    result: {
      accuracy: Number,
      distance: Number,
      angle: Number,
      speed: Number
    }
  }],
  statistics: Stats,
  videoUrl: String
}
```

## AI/ML Pipeline

### 1. Bildförbehandling
- Kontrastförbättring (CLAHE)
- Brusreducering
- Perspektivkorrigering

### 2. Objektdetektering
- YOLO/SSD för realtidsdetektering
- Färgbaserad segmentering (backup)
- Hough Circle Transform

### 3. Avståndsberäkning
**Metoder:**
- **Triangulering**: Använder kameramatris
- **ARKit/ARCore**: Djupdata från AR
- **LiDAR**: Exakta mätningar (nyare enheter)

**Formel:**
```
realDistance = (pixelDistance × estimatedDistance) / focalLength
```

### 4. Kastteknikanalys
- CNN-baserad klassificering
- Pose estimation
- Rörelseanalys från video

## Säkerhet

### Autentisering
- JWT tokens
- Refresh tokens
- Password hashing (bcrypt)

### API-säkerhet
- Rate limiting
- CORS-konfiguration
- Input validation
- SQL injection-skydd

### Datalagring
- Krypterade lösenord
- HTTPS för all kommunikation
- Säker medialagring (Cloudinary)

## Skalbarhet

### Horisontell skalning
- Stateless API
- Load balancing
- Databas-replikering

### Caching
- Redis för sessions
- CDN för media
- Client-side caching

### Optimering
- Lazy loading
- Image compression
- Database indexing
- Query optimization

## Deployment

### Frontend
- Expo EAS Build
- App Store & Google Play

### Backend
- Docker containers
- AWS/Azure/GCP
- CI/CD med GitHub Actions

### Databas
- MongoDB Atlas (managed)
- Automatiska backups
- Monitoring

## Framtida förbättringar

1. **AR-integration**: Overlay av virtuella boular
2. **Multiplayer**: Realtidsspel över internet
3. **Turnering-system**: Organisera och delta i turneringar
4. **Video-tutorials**: Interaktiva träningslektioner
5. **Wearable-integration**: Apple Watch, Fitbit
6. **3D-visualisering**: Replay av kast i 3D
7. **Röstkommandon**: Handsfree-kontroll
8. **Offline ML**: On-device inference med TensorFlow Lite
