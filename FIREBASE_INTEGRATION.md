# 🔥 FIREBASE INTEGRATION - Snabbguide

## ✅ Du har skapat Firebase! Nu integrerar vi det i appen.

---

## 📝 STEG 1: Hämta din Firebase Config (1 minut)

1. Gå till Firebase Console: https://console.firebase.google.com
2. Välj ditt projekt: **boule-petanque-training**
3. Klicka på ⚙️ **Settings** (bredvid Project Overview)
4. Scrolla ner till **"Your apps"** eller **"SDK setup and configuration"**
5. Du ser något som liknar detta:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "boule-petanque-training.firebaseapp.com",
  projectId: "boule-petanque-training",
  storageBucket: "boule-petanque-training.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

**KOPIERA hela detta objekt!**

---

## 🔧 STEG 2: Uppdatera Firebase Config (30 sekunder)

1. Öppna filen: `frontend/src/config/firebase.js`
2. Ersätt denna del:

```javascript
// ❌ Ersätt DETTA:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  // ...
};

// ✅ Med DIN faktiska config från Firebase Console:
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "boule-petanque-training.firebaseapp.com",
  projectId: "boule-petanque-training",
  storageBucket: "boule-petanque-training.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

3. **Spara filen**

---

## 📦 STEG 3: Installera Firebase (5 minuter)

Öppna terminal och kör:

```bash
cd /Users/admin/Agentic\ IDE/Boule-Petanque-Training-App/frontend

# Installera Firebase
npm install firebase

# Detta kan ta 2-5 minuter - det är normalt!
# Låt det köra klart.
```

**Medan det installerar - fortsätt läsa!** ⬇️

---

## 🧪 STEG 4: Test Firebase Connection (1 minut)

Efter npm install är klar, skapa en test-fil:

```bash
cat > src/test-firebase.js << 'EOF'
import { db, auth } from './config/firebase';
import { collection, addDoc } from 'firebase/firestore';

console.log('🔥 Testing Firebase connection...');

// Test Firestore
async function testFirebase() {
  try {
    // Test: Skriv till database
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Hello from Boule Petanque App!',
      timestamp: new Date(),
      test: true
    });
    
    console.log('✅ SUCCESS! Firebase connected!');
    console.log('✅ Document created with ID:', docRef.id);
    console.log('✅ Auth ready:', auth ? 'Yes' : 'No');
    console.log('✅ Firestore ready:', db ? 'Yes' : 'No');
    
    return true;
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

testFirebase();
EOF

# Kör test
node src/test-firebase.js
```

**Om du ser "✅ SUCCESS!" = Firebase fungerar!** 🎉

---

## 🎯 STEG 5: Använd Firebase i Appen

### Exempel: Spara träningsdata

```javascript
// I vilken komponent som helst:
import { db } from './config/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Spara träningspass
const saveTrainingSession = async (sessionData) => {
  try {
    const docRef = await addDoc(collection(db, 'trainingSessions'), {
      userId: currentUser.uid,
      type: sessionData.type,
      score: sessionData.score,
      throws: sessionData.throws,
      timestamp: new Date()
    });
    
    console.log('✅ Training session saved:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving:', error);
  }
};
```

### Exempel: Autentisering

```javascript
import { auth } from './config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Registrera ny användare
const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ User created:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Sign up error:', error.message);
  }
};

// Logga in
const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User logged in:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Sign in error:', error.message);
  }
};
```

### Exempel: Ladda upp bild

```javascript
import { storage } from './config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Ladda upp träningsvideo
const uploadVideo = async (file, userId) => {
  try {
    const storageRef = ref(storage, `videos/${userId}/${Date.now()}.mp4`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Video uploaded:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ Upload error:', error);
  }
};
```

---

## 📊 FIREBASE COLLECTIONS STRUKTUR

Skapa dessa collections i Firestore:

### 1. **users** - Användare
```javascript
{
  uid: "abc123",
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  createdAt: timestamp,
  stats: {
    totalSessions: 0,
    totalGames: 0,
    averageScore: 0
  }
}
```

### 2. **trainingSessions** - Träningspass
```javascript
{
  userId: "abc123",
  type: "pointing" | "shooting" | "rolling",
  startTime: timestamp,
  endTime: timestamp,
  throws: [
    {
      accuracy: 8.5,
      distance: 2.3,
      videoUrl: "https://..."
    }
  ],
  stats: {
    averageAccuracy: 8.2,
    totalThrows: 20
  }
}
```

### 3. **games** - Matcher
```javascript
{
  players: ["userId1", "userId2"],
  status: "active" | "completed",
  score: { userId1: 13, userId2: 8 },
  startTime: timestamp,
  winner: "userId1"
}
```

---

## 🔒 SÄKERHET: Uppdatera Firestore Rules

1. Gå till Firebase Console
2. **Firestore Database** → **Rules** tab
3. Ersätt med detta:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users kan läsa alla users, men bara uppdatera sig själva
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Training sessions - bara egna
    match /trainingSessions/{sessionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Games - deltagare kan läsa och uppdatera
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid in resource.data.players;
    }
  }
}
```

4. Klicka **"Publish"**

---

## 🚀 NÄSTA STEG

### Efter Firebase är integrerat:

1. ✅ **Testa basic functions** - Skapa, läsa, uppdatera data
2. ✅ **Implementera autentisering** - Sign up, login, logout
3. ✅ **Bygg träningsfunktioner** - Spara sessions, statistik
4. ✅ **Lägg till bilduppladdning** - Videos och foton
5. ✅ **Implementera realtid** - Live game updates

---

## 💡 TIPS

### Firebase är MYCKET snabbare än traditionell backend!

**Traditionell backend:**
```javascript
// 1. Anropa API
const response = await fetch('/api/sessions', {
  method: 'POST',
  body: JSON.stringify(data)
});

// 2. Vänta på svar
// 3. Hantera errors
// 4. Uppdatera UI
```

**Med Firebase:**
```javascript
// En rad - KLART!
await addDoc(collection(db, 'sessions'), data);
```

### Offline Support!
Firebase cachar data automatiskt - appen fungerar offline! 📱

### Realtid Updates!
Data synkar live mellan alla användare! 🔄

---

## 🆘 TROUBLESHOOTING

### Problem: "Firebase not defined"
**Lösning:**
```bash
npm install firebase
```

### Problem: "Permission denied"
**Lösning:** Uppdatera Firestore Rules (se ovan)

### Problem: "Invalid API key"
**Lösning:** Kolla att du kopierat rätt config från Firebase Console

---

## ✅ CHECKLIST

- [ ] Firebase config kopierad
- [ ] `firebase.js` uppdaterad
- [ ] `npm install firebase` kört
- [ ] Test-script kört (✅ SUCCESS!)
- [ ] Firestore Rules uppdaterade
- [ ] Börja bygga! 🚀

---

**Firebase är nu integrerat! Börja bygga din app!** 🔥

**Frågor? Säg bara till!** 😊
