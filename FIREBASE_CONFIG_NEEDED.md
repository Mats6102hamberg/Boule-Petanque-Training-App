# 🔥 FIREBASE CONFIG BEHÖVS!

## Snabbguide - 2 minuter:

### STEG 1: Öppna Firebase Console
👉 https://console.firebase.google.com

### STEG 2: Välj ditt projekt
Klicka på **"boule-petanque-training"**

### STEG 3: Hämta Config
1. Klicka på ⚙️ **Settings** (bredvid Project Overview)
2. Scrolla ner till **"Your apps"**
3. Om du INTE ser någon web app:
   - Klicka **</>** (Web icon)
   - App nickname: **"Boule Web"**
   - ✅ Also set up Firebase Hosting
   - Klicka **"Register app"**

4. Du ser nu något som liknar detta:

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

### STEG 4: Kopiera CONFIG
**Kopiera hela firebaseConfig objektet**

### STEG 5: Klistra in här i chatten
Skriv bara:
```
apiKey: AIza...
authDomain: boule...
projectId: boule...
```

**Jag uppdaterar sedan automatiskt alla filer!** 🚀

---

## ⚠️ VIKTIGT:
Firebase config är INTE hemlig! Den är designad att vara publik.
Det som skyddar din data är Security Rules (som jag redan satt upp).

Så det är säkert att dela den här! ✅
