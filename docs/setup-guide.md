# Setup Guide - Boule Pétanque Training App

## Förutsättningar

### Allmänt
- Node.js 18+ och npm/yarn
- Python 3.9+
- MongoDB 6.0+
- Git

### För iOS-utveckling
- macOS
- Xcode 14+
- CocoaPods
- iOS Simulator eller fysisk enhet

### För Android-utveckling
- Android Studio
- Android SDK
- Android Emulator eller fysisk enhet

## Installation

### 1. Klona repository

```bash
git clone https://github.com/Mats6102hamberg/Boule-Petanque-Training-App.git
cd Boule-Petanque-Training-App
```

### 2. Frontend Setup (React Native)

```bash
cd frontend

# Installera dependencies
npm install

# För iOS (endast macOS)
cd ios
pod install
cd ..

# Starta Expo
npm start

# Eller kör direkt på enhet
npm run ios      # För iOS
npm run android  # För Android
```

#### Konfigurera miljövariabler

Skapa `.env` fil i `frontend/`:

```env
API_URL=http://localhost:3000/api
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_preset
```

### 3. Backend Setup (Node.js)

```bash
cd backend

# Installera dependencies
npm install

# Konfigurera miljövariabler
cp .env.example .env
```

Redigera `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/boule-petanque

# JWT
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

Starta servern:

```bash
# Development mode med auto-reload
npm run dev

# Production mode
npm start
```

### 4. AI/ML Setup (Python)

```bash
cd ai-ml

# Skapa virtual environment
python -m venv venv

# Aktivera virtual environment
# På macOS/Linux:
source venv/bin/activate
# På Windows:
venv\Scripts\activate

# Installera dependencies
pip install -r requirements.txt
```

#### Träna modeller (optional)

```bash
# Ladda ner träningsdata
python scripts/download_dataset.py

# Träna throw analysis model
python models/throw_analysis/train_model.py

# Träna object detection model
python models/distance_calculation/train_detector.py
```

### 5. Databas Setup (MongoDB)

#### Lokal installation

**macOS (med Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Ubuntu:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Eller använd MongoDB Atlas (cloud)

1. Gå till [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Skapa gratis cluster
3. Hämta connection string
4. Uppdatera `MONGODB_URI` i `.env`

#### Initiera databas

```bash
cd backend
npm run seed  # Skapar initial data
```

## Utveckling

### Kör hela stacken samtidigt

I root-katalogen, skapa `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/boule-petanque
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis

volumes:
  mongodb_data:
```

Kör med Docker:

```bash
docker-compose up
```

### Hot Reload

- **Frontend**: Expo har inbyggd hot reload
- **Backend**: Använd `nodemon` (inkluderat i dev-dependencies)
- **AI/ML**: Använd Flask development server

## Testing

### Frontend

```bash
cd frontend
npm test                    # Kör alla tester
npm test -- --coverage      # Med coverage report
```

### Backend

```bash
cd backend
npm test                    # Kör alla tester
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

### AI/ML

```bash
cd ai-ml
pytest                      # Kör alla tester
pytest --cov=.              # Med coverage
```

## Felsökning

### Problem: "Unable to resolve module"

```bash
cd frontend
rm -rf node_modules
npm install
npm start -- --reset-cache
```

### Problem: "Expo Go app not connecting"

1. Kontrollera att mobil och dator är på samma nätverk
2. Prova att använda tunnel mode: `expo start --tunnel`
3. Kontrollera firewall-inställningar

### Problem: MongoDB connection error

1. Kontrollera att MongoDB körs: `brew services list` (macOS)
2. Verifiera connection string i `.env`
3. Testa connection: `mongosh`

### Problem: Camera permissions

**iOS:**
Lägg till i `Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Vi behöver tillgång till kameran för att analysera dina kast</string>
```

**Android:**
Lägg till i `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

## Deployment

### Frontend (Expo)

```bash
cd frontend

# Build för iOS
eas build --platform ios

# Build för Android
eas build --platform android

# Submit till App Store
eas submit --platform ios

# Submit till Google Play
eas submit --platform android
```

### Backend

```bash
cd backend

# Build Docker image
docker build -t boule-backend .

# Deploy till cloud (exempel: Heroku)
heroku container:push web
heroku container:release web
```

### Databas

För produktion, använd MongoDB Atlas eller liknande managed service.

## Nästa steg

1. Läs [API Documentation](./api-docs.md)
2. Bekanta dig med [Architecture](./architecture.md)
3. Besök [GitHub Repository](https://github.com/Mats6102hamberg/Boule-Petanque-Training-App)
4. Börja utveckla! 🚀

## Support

- GitHub Issues: [github.com/Mats6102hamberg/Boule-Petanque-Training-App/issues](https://github.com/Mats6102hamberg/Boule-Petanque-Training-App/issues)
- GitHub Repo: [github.com/Mats6102hamberg/Boule-Petanque-Training-App](https://github.com/Mats6102hamberg/Boule-Petanque-Training-App)
- Email: mats6102hamberg@gmail.com
