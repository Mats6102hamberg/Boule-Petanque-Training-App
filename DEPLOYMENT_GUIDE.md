# 🚀 Deployment Guide - Boule Pétanque Training App

## 🌍 Gör appen tillgänglig för alla!

Just nu körs appen bara lokalt på din dator. Här är tre sätt att göra den tillgänglig för andra:

---

## 📱 **Alternativ 1: Expo Go + Tunnel (Snabbast för test)**

### **Fördelar:**
- ✅ Snabbast att sätta upp (5 minuter)
- ✅ Gratis
- ✅ Perfekt för test och demo
- ✅ Ingen app store-publicering behövs

### **Nackdelar:**
- ❌ Kräver Expo Go-appen
- ❌ Begränsad funktionalitet
- ❌ Inte för produktion

### **Steg:**

```bash
# 1. Installera ngrok (för tunnel)
brew install ngrok

# 2. Starta backend med ngrok
cd backend
npm run dev

# I nytt terminal-fönster:
ngrok http 3000
# Kopiera URL (t.ex. https://abc123.ngrok.io)

# 3. Uppdatera frontend .env
# Ändra API_URL till ngrok-URL
echo "API_URL=https://abc123.ngrok.io/api" > frontend/.env

# 4. Starta frontend med tunnel
cd frontend
npx expo start --tunnel

# 5. Dela QR-koden med andra!
# De kan scanna med Expo Go och använda appen
```

**Användare behöver:**
- Expo Go-appen (gratis från App Store/Google Play)
- QR-koden du delar

---

## 🏢 **Alternativ 2: Full Cloud Deployment (Produktion)**

### **Fördelar:**
- ✅ Professionell lösning
- ✅ Alltid tillgänglig
- ✅ Skalbar
- ✅ Egen domän

### **Nackdelar:**
- ❌ Tar längre tid (1-2 timmar)
- ❌ Kostar pengar (från ~$5/månad)
- ❌ Mer komplext

### **Komponenter att deploya:**

#### **1. Backend (Node.js API)**

**Alternativ A: Railway.app** (Rekommenderat - Enklast)
```bash
# 1. Skapa konto på railway.app
# 2. Installera Railway CLI
npm install -g @railway/cli

# 3. Logga in
railway login

# 4. Deploya backend
cd backend
railway init
railway up

# 5. Lägg till miljövariabler i Railway dashboard
# - MONGODB_URI
# - JWT_SECRET
# - etc.

# 6. Få din URL (t.ex. https://your-app.railway.app)
```

**Alternativ B: Heroku**
```bash
# 1. Installera Heroku CLI
brew tap heroku/brew && brew install heroku

# 2. Logga in
heroku login

# 3. Skapa app
cd backend
heroku create boule-petanque-api

# 4. Lägg till MongoDB
heroku addons:create mongolab:sandbox

# 5. Sätt miljövariabler
heroku config:set JWT_SECRET=your_secret_key

# 6. Deploya
git push heroku main

# 7. Öppna
heroku open
```

**Alternativ C: Vercel** (Gratis för hobby)
```bash
# 1. Installera Vercel CLI
npm install -g vercel

# 2. Deploya
cd backend
vercel

# Följ instruktionerna
```

#### **2. Database (MongoDB)**

**MongoDB Atlas** (Gratis tier finns!)
```bash
# 1. Gå till https://www.mongodb.com/cloud/atlas
# 2. Skapa gratis konto
# 3. Skapa cluster (välj FREE tier)
# 4. Skapa database user
# 5. Whitelist IP (0.0.0.0/0 för alla)
# 6. Kopiera connection string
# 7. Uppdatera MONGODB_URI i backend

# Connection string ser ut så här:
# mongodb+srv://username:password@cluster.mongodb.net/boule-petanque
```

#### **3. Frontend (React Native App)**

**Alternativ A: Expo EAS Build** (Rekommenderat)
```bash
# 1. Installera EAS CLI
npm install -g eas-cli

# 2. Logga in på Expo
eas login

# 3. Konfigurera projekt
cd frontend
eas build:configure

# 4. Uppdatera API_URL i .env till din backend-URL
echo "API_URL=https://your-backend.railway.app/api" > .env

# 5. Bygg för iOS
eas build --platform ios

# 6. Bygg för Android
eas build --platform android

# 7. Submitta till App Store/Google Play
eas submit --platform ios
eas submit --platform android
```

**Alternativ B: Expo Publish** (Snabbare, men kräver Expo Go)
```bash
cd frontend
expo publish

# Dela länken med användare
# De kan öppna i Expo Go
```

---

## 🎯 **Alternativ 3: Hybrid (Rekommenderat för start)**

Kombinera det bästa från båda världarna:

### **Fas 1: Test & Demo (Nu)**
```bash
# Backend: Railway/Vercel (gratis)
# Database: MongoDB Atlas (gratis)
# Frontend: Expo Go med tunnel
```

### **Fas 2: Beta (Om 1-2 veckor)**
```bash
# Backend: Railway/Heroku (betald plan)
# Database: MongoDB Atlas (betald plan)
# Frontend: TestFlight (iOS) / Internal Testing (Android)
```

### **Fas 3: Produktion (Om 1-2 månader)**
```bash
# Backend: AWS/GCP/Azure
# Database: MongoDB Atlas (production tier)
# Frontend: App Store + Google Play
```

---

## 💰 **Kostnadskalkyl**

### **Gratis (Hobby/Test):**
```
Backend:   Railway/Vercel Free    $0/månad
Database:  MongoDB Atlas Free     $0/månad
Frontend:  Expo Go                $0/månad
Total:                            $0/månad
```

### **Starter (Beta):**
```
Backend:   Railway Starter        $5/månad
Database:  MongoDB Atlas M10      $10/månad
Frontend:  Expo EAS Build         $0 (limited builds)
Total:                            $15/månad
```

### **Produktion:**
```
Backend:   Railway Pro            $20/månad
Database:  MongoDB Atlas M20      $50/månad
Frontend:  Apple Developer        $99/år
           Google Play            $25 engångsavgift
CDN:       Cloudinary             $0-20/månad
Total:                            ~$90/månad + $124/år
```

---

## 🚀 **Snabbstart: Deploya på 30 minuter**

### **Steg 1: Backend (Railway)**
```bash
# 1. Gå till railway.app och skapa konto
# 2. Klicka "New Project" → "Deploy from GitHub"
# 3. Välj ditt repo och backend-mappen
# 4. Lägg till miljövariabler
# 5. Deploya!
```

### **Steg 2: Database (MongoDB Atlas)**
```bash
# 1. Gå till mongodb.com/cloud/atlas
# 2. Skapa gratis konto
# 3. Skapa cluster (FREE tier)
# 4. Kopiera connection string
# 5. Lägg till i Railway miljövariabler
```

### **Steg 3: Frontend (Expo Publish)**
```bash
cd frontend

# Uppdatera API_URL
echo "API_URL=https://your-railway-app.railway.app/api" > .env

# Publicera
npx expo publish

# Dela länken!
```

---

## 📋 **Checklista innan produktion:**

### **Backend:**
- [ ] Miljövariabler säkert konfigurerade
- [ ] CORS korrekt inställt
- [ ] Rate limiting aktiverat
- [ ] Error logging (Sentry/LogRocket)
- [ ] Health check endpoint fungerar
- [ ] SSL/HTTPS aktiverat

### **Database:**
- [ ] Backups konfigurerade
- [ ] Indexering optimerad
- [ ] Connection pooling konfigurerat
- [ ] Monitoring aktiverat

### **Frontend:**
- [ ] API_URL pekar på produktion
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics/Mixpanel)
- [ ] Push notifications konfigurerade
- [ ] App ikoner och splash screens
- [ ] Privacy policy & Terms of Service

### **Säkerhet:**
- [ ] JWT secrets roterade
- [ ] API keys säkrade
- [ ] Input validation
- [ ] XSS protection
- [ ] SQL injection protection

---

## 🆘 **Hjälp & Support**

### **Railway:**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### **MongoDB Atlas:**
- Docs: https://docs.atlas.mongodb.com
- Support: https://support.mongodb.com

### **Expo:**
- Docs: https://docs.expo.dev
- Forums: https://forums.expo.dev

---

## 🎯 **Rekommendation för dig:**

**För att snabbt testa med andra:**
```bash
# 1. Deploya backend till Railway (5 min)
# 2. Sätt upp MongoDB Atlas (5 min)
# 3. Uppdatera frontend .env
# 4. Kör: npx expo start --tunnel
# 5. Dela QR-kod!
```

**För produktion:**
- Vänta tills du har testat ordentligt
- Bygg med EAS Build
- Submitta till App Store/Google Play

---

## 📞 **Vill du ha hjälp?**

Säg till vilken väg du vill gå så hjälper jag dig steg för steg! 🚀

**Rekommendation: Börja med Railway + MongoDB Atlas + Expo Tunnel**
