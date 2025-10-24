# 🔥 FIREBASE SETUP - Allt-i-ett Lösning (GRATIS!)

## 🎯 Vad vi ska göra (15 minuter):
Firebase ger oss ALLT vi behöver i ett paket:
- ✅ Database (Firestore)
- ✅ Autentisering (Users)
- ✅ Storage (Bilder/Videos)
- ✅ Hosting (Web app)
- ✅ Cloud Functions (Backend logic)
- ✅ Analytics
- ✅ Push Notifications

**ALLT GRATIS!** 🎉

---

## 🔥 STEG 1: Skapa Firebase Project (3 minuter)

### 1.1 Gå till Firebase Console
1. Öppna: https://console.firebase.google.com
2. Logga in med Google-konto
3. Klicka **"Add project"** (Lägg till projekt)

### 1.2 Skapa projekt
1. **Project name:** `boule-petanque-training`
2. Klicka **"Continue"**
3. **Google Analytics:** Välj **"Enable"** (rekommenderat)
4. Klicka **"Continue"**
5. Välj eller skapa **Analytics account**
6. Klicka **"Create project"**
7. Vänta ~30 sekunder medan Firebase sätter upp allt
8. Klicka **"Continue"** när det är klart

✅ **Projekt skapat!**

---

## 📱 STEG 2: Lägg till Firebase till din App (5 minuter)

### 2.1 Registrera iOS App
1. I Firebase Console, klicka iOS-ikonen
2. **iOS bundle ID:** `com.yourname.boulepetanque`
3. **App nickname:** `Boule Petanque iOS`
4. Klicka **"Register app"**
5. **Ladda ner** `GoogleService-Info.plist`
6. Klicka **"Next"** → **"Next"** → **"Continue to console"**

### 2.2 Registrera Android App
1. I Firebase Console, klicka Android-ikonen
2. **Android package name:** `com.yourname.boulepetanque`
3. **App nickname:** `Boule Petanque Android`
4. Klicka **"Register app"**
5. **Ladda ner** `google-services.json`
6. Klicka **"Next"** → **"Next"** → **"Continue to console"**

### 2.3 Registrera Web App
1. I Firebase Console, klicka Web-ikonen (</>)
2. **App nickname:** `Boule Petanque Web`
3. ✅ Markera **"Also set up Firebase Hosting"**
4. Klicka **"Register app"**
5. **KOPIERA config-objektet** - ser ut så här:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "boule-petanque-training.firebaseapp.com",
  projectId: "boule-petanque-training",
  storageBucket: "boule-petanque-training.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

**SPARA detta config-objekt!** Vi behöver det strax.

---

## 🗄️ STEG 3: Aktivera Firestore Database (2 minuter)

### 3.1 Skapa Database
1. I Firebase Console, gå till **"Firestore Database"** (vänster meny)
2. Klicka **"Create database"**
3. Välj **"Start in test mode"** (för nu - vi ändrar senare)
4. Välj **location:** `europe-west1` (närmaste Europa)
5. Klicka **"Enable"**

✅ **Database aktiverad!**

### 3.2 Skapa Collections (strukturera data)
Firebase skapar collections automatiskt när du skriver data, men här är strukturen:

```
firestore/
├── users/              # Användare
├── trainingSessions/   # Träningspass
├── games/             # Matcher/Spel
├── achievements/      # Achievements
├── challenges/        # Dagliga utmaningar
└── statistics/        # Statistik
```

---

## 🔐 STEG 4: Aktivera Authentication (1 minut)

### 4.1 Aktivera Auth-metoder
1. I Firebase Console, gå till **"Authentication"**
2. Klicka **"Get started"**
3. Gå till **"Sign-in method"** tab
4. Aktivera dessa metoder:
   - ✅ **Email/Password** (klicka → Enable → Save)
   - ✅ **Google** (klicka → Enable → Save)
   - ✅ **Anonymous** (för guest users)

✅ **Authentication aktiverad!**

---

## 📦 STEG 5: Aktivera Storage (1 minut)

### 5.1 Aktivera Cloud Storage
1. I Firebase Console, gå till **"Storage"**
2. Klicka **"Get started"**
3. Välj **"Start in test mode"** (för nu)
4. Välj **location:** `europe-west1`
5. Klicka **"Done"**

✅ **Storage aktiverad!** Nu kan du lagra bilder och videos.

---

## 💻 STEG 6: Installera Firebase i din App (3 minuter)

### 6.1 Installera Firebase SDK
```bash
cd /Users/admin/Agentic\ IDE/Boule-Petanque-Training-App/frontend
npm install firebase
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
npm install @react-native-firebase/storage
```

### 6.2 Skapa Firebase Config
```bash
# Skapa firebase config fil
cat > src/config/firebase.js << 'EOF'
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration - Från Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "boule-petanque-training.firebaseapp.com",
  projectId: "boule-petanque-training",
  storageBucket: "boule-petanque-training.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
EOF
```

**VIKTIGT:** Byt ut firebaseConfig med din egen från steg 2.3!

---

## ✅ STEG 7: Test att allt fungerar

### 7.1 Test Firebase Connection
```bash
cd frontend
cat > src/test-firebase.js << 'EOF'
import { db } from './config/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Test Firestore
async function testFirebase() {
  try {
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Hello Firebase!',
      timestamp: new Date()
    });
    console.log('✅ Firebase fungerar! Document ID:', docRef.id);
  } catch (error) {
    console.error('❌ Firebase error:', error);
  }
}

testFirebase();
EOF

# Kör test
node src/test-firebase.js
```

Om du ser "✅ Firebase fungerar!" = **ALLT KLART!**

---

## 💰 GRATIS TIER LIMITS

Firebase Spark Plan (GRATIS för alltid):

```
Firestore:
  ✅ 1 GB lagring
  ✅ 50,000 läsningar/dag
  ✅ 20,000 skrivningar/dag
  
Authentication:
  ✅ 10,000 verifieringar/månad (SMS)
  ✅ Unlimited email/Google/social auth
  
Storage:
  ✅ 5 GB total lagring
  ✅ 1 GB uppladdning/dag
  ✅ 50 GB nedladdning/dag
  
Hosting:
  ✅ 10 GB lagring
  ✅ 360 MB/dag transfer
  
Cloud Functions:
  ✅ 125K invocations/månad
  ✅ 40K GB-seconds/månad
```

**Detta räcker LÅNGT för 1000+ aktiva användare!** 🎉

---

## 📊 FIREBASE DATASTRUKTUR

### Users Collection
```javascript
users/{userId}
  ├── uid: "abc123"
  ├── email: "user@example.com"
  ├── displayName: "John Doe"
  ├── photoURL: "https://..."
  ├── createdAt: timestamp
  ├── stats: {
  │     totalTrainingSessions: 42
  │     totalGames: 15
  │     averageScore: 8.5
  │   }
  └── achievements: ["first_win", "10_games"]
```

### Training Sessions Collection
```javascript
trainingSessions/{sessionId}
  ├── userId: "abc123"
  ├── type: "pointing" | "shooting" | "rolling"
  ├── startTime: timestamp
  ├── endTime: timestamp
  ├── throws: [
  │     {
  │       accuracy: 8.5,
  │       distance: 2.3,
  │       angle: 45,
  │       videoUrl: "https://...",
  │       timestamp: timestamp
  │     }
  │   ]
  ├── stats: {
  │     averageAccuracy: 8.2,
  │     totalThrows: 20
  │   }
  └── createdAt: timestamp
```

### Games Collection
```javascript
games/{gameId}
  ├── players: ["userId1", "userId2"]
  ├── status: "active" | "completed"
  ├── score: { userId1: 13, userId2: 8 }
  ├── rounds: [...]
  ├── startTime: timestamp
  ├── endTime: timestamp
  └── winner: "userId1"
```

---

## 🔒 SÄKERHET: Firebase Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Training sessions
    match /trainingSessions/{sessionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Games
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid in resource.data.players;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /videos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.resource.size < 50 * 1024 * 1024; // Max 50MB
    }
  }
}
```

---

## 🚀 DEPLOYMENT MED FIREBASE HOSTING

### Deploya Web App
```bash
# Installera Firebase CLI
npm install -g firebase-tools

# Logga in
firebase login

# Initiera
cd frontend
firebase init hosting

# Bygg app
npm run build

# Deploya
firebase deploy --only hosting

# Din app är nu live på:
# https://boule-petanque-training.web.app
```

---

## 📱 EXPO + FIREBASE INTEGRATION

### App.js med Firebase
```javascript
import React, { useEffect, useState } from 'react';
import { auth } from './src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <MainApp /> : <AuthScreen />;
}
```

---

## 🎯 FÖRDELAR MED FIREBASE

### ✅ Backend-as-a-Service
- Ingen backend-kod behövs!
- Allt hanteras av Google
- Auto-scaling
- 99.95% uptime SLA

### ✅ Realtid
- Live sync mellan enheter
- WebSocket under huven
- Offline support inbyggt

### ✅ Autentisering
- Email/Password
- Google/Facebook/Apple
- Phone authentication
- Anonymous users

### ✅ Analytics
- Gratis användarbeteende-tracking
- Crash reporting
- Performance monitoring

### ✅ Push Notifications
- Cloud Messaging gratis
- Segmentering
- Scheduled notifications

---

## 💡 VARFÖR FIREBASE ÄR PERFEKT FÖR DIG

### Din app behöver:
- ✅ Users & Auth → **Firebase Authentication**
- ✅ Data storage → **Firestore**
- ✅ Bilder/Videos → **Firebase Storage**
- ✅ Realtid updates → **Firestore realtime**
- ✅ Analytics → **Firebase Analytics**
- ✅ Push notifications → **Cloud Messaging**
- ✅ Hosting → **Firebase Hosting**

**ALLT finns i Firebase! Ett paket, gratis!** 🎉

---

## 📞 NÄSTA STEG

1. ✅ Skapa Firebase projekt
2. ✅ Aktivera Firestore, Auth, Storage
3. ✅ Installera Firebase SDK
4. ✅ Konfigurera firebase.js
5. ✅ Testa connection
6. 🚀 Börja bygga!

---

## 🆘 SUPPORT

- Firebase Docs: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com
- Community: https://firebase.google.com/community

---

**Firebase är det ENKLASTE och KRAFTFULLASTE valet!** 🔥

**Ingen backend-kod, ingen server-setup, bara BYGG!** 🚀
