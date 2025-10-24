# 🚀 VERCEL DEPLOYMENT GUIDE

## ⚠️ VIKTIGT ATT VETA:

Detta är en **React Native/Expo app**, inte en vanlig web app.

**Du har 3 alternativ:**

---

## 📱 ALTERNATIV 1: Expo Go (SNABBAST - 2 MIN)

### För att testa på telefon DIREKT:

```bash
cd frontend
npm start
```

- Scanna QR-kod med Expo Go
- Appen körs på din telefon!
- Perfekt för test och utveckling

✅ **Gratis**
✅ **Fungerar på iOS + Android**
✅ **Ingen deployment behövs**

---

## 🌐 ALTERNATIV 2: Expo Web + Vercel (10 MIN)

### Kör appen som web app på Vercel:

#### STEG 1: Bygg för web
```bash
cd frontend

# Installera dependencies
npm install

# Bygg för web
npx expo export:web

# Detta skapar en "web-build" folder
```

#### STEG 2: Deploya till Vercel
```bash
# Installera Vercel CLI
npm install -g vercel

# Deploya
cd web-build
vercel

# Följ instruktionerna
# Välj project name: boule-petanque-training
# Välj settings: default
```

#### STEG 3: Färdig!
Din app är nu live på: `https://boule-petanque-training.vercel.app`

✅ **Fungerar i browser**
✅ **Delbar länk**
❌ **Ingen kamera/AR (web-begränsningar)**

---

## 📲 ALTERNATIV 3: Riktiga Apps (2-4 VECKOR)

### För App Store & Google Play:

```bash
# Installera EAS CLI
npm install -g eas-cli

# Logga in
eas login

# Konfigurera
eas build:configure

# Bygg iOS
eas build --platform ios

# Bygg Android
eas build --platform android

# Submitta till stores
eas submit
```

✅ **Riktig native app**
✅ **Full funktionalitet (kamera, AR, etc)**
❌ **Tar längre tid**
💰 **Kostar: $99/år (iOS) + $25 (Android)**

---

## 🎯 MIN REKOMMENDATION:

### FÖR TEST NU:
```bash
cd frontend
npm start
# Scanna QR-kod med Expo Go
```
**→ Appen körs på din telefon på 2 minuter!**

### FÖR DEMO/DELA:
```bash
npx expo export:web
cd web-build
vercel
```
**→ Web-version på Vercel för att dela länk!**

### FÖR PRODUKTION:
```bash
eas build --platform all
```
**→ Riktiga appar i App Store + Google Play!**

---

## 🚀 VILL DU KÖRA APPEN NU?

Välj ett alternativ så hjälper jag dig:

1. **"expo"** - Kör på telefon med Expo Go (snabbast)
2. **"web"** - Bygg web-version och deploya till Vercel
3. **"native"** - Bygg riktiga appar

**Säg bara "expo", "web" eller "native"!** 🎯
