# 🧪 Test Guide - Boule Pétanque Training App

## 🎯 Snabbtest av systemet

### **Test 1: Backend API** ✅

Testa att backend-servern svarar:

```bash
# Hälsokontroll
curl http://localhost:3000/health

# Förväntat svar:
# {"status":"OK","timestamp":"2025-10-13T...","uptime":123.456}
```

### **Test 2: Bildanalys Endpoint** ✅

Testa bildanalys-endpointen med en testbild:

```bash
# Skapa en testbild
curl -X POST http://localhost:3000/api/training/analyze \
  -F "image=@/path/to/test-image.jpg" \
  -F "trainingMode=pointing"

# Förväntat svar:
# {
#   "success": true,
#   "distance": 0.35,
#   "objects": [...],
#   "confidence": 0.85
# }
```

### **Test 3: Frontend Navigation** ✅

1. Öppna appen i Expo Go
2. Navigera mellan flikarna:
   - Hem ✅
   - Träning ✅
   - Spel ✅
   - Profil ✅

### **Test 4: Kamera-integration** ✅

1. Gå till **Träning**-fliken
2. Välj **Pointing**
3. Kameran ska öppnas
4. Ta ett foto
5. Vänta på analys
6. Kontrollera att avstånd visas

---

## 📱 Manuella tester

### **Träningsflöde**

**Steg 1: Starta träning**
- [ ] Öppna Träning-fliken
- [ ] Se tre träningstyper (Pointing, Shooting, Rolling)
- [ ] Klicka på "Pointing"

**Steg 2: Använd kameran**
- [ ] Kameran öppnas
- [ ] Instruktioner visas: "📍 Pointing: Sikta nära cochonnet"
- [ ] Ta ett foto genom att klicka på den vita knappen
- [ ] "Analyserar... 🤖" visas

**Steg 3: Se resultat**
- [ ] Alert visas med avstånd
- [ ] Avstånd visas i overlay (t.ex. "📏 Avstånd: 35.2 cm")
- [ ] Kastet registreras automatiskt
- [ ] Progress bar uppdateras

**Steg 4: Fortsätt träning**
- [ ] Ta fler foton
- [ ] Se progress öka
- [ ] När målet nås, gå till nästa övning

---

## 🔍 Debug-tips

### **Kontrollera backend-loggar:**
```bash
# Se vad som händer i backend
tail -f backend/logs/app.log

# Eller kolla direkt i terminalen där backend körs
```

### **Kontrollera frontend-loggar:**
```bash
# I Expo-terminalen, tryck:
# j - öppna debugger
# r - reload app
```

### **Testa API direkt:**
```bash
# Använd Postman eller curl för att testa endpoints
curl -X GET http://localhost:3000/health
curl -X GET http://localhost:3000/api/training/stats
```

---

## 🎨 UI/UX Checklist

### **Hemskärm**
- [ ] Stats visas (Level, Poäng, Streak)
- [ ] "Starta Träning"-knapp fungerar
- [ ] Navigation fungerar

### **Träningsskärm**
- [ ] Tre träningstyper visas
- [ ] Ikoner och beskrivningar är tydliga
- [ ] "Kalibrera Kamera"-knapp finns
- [ ] Tips-sektion visas

### **Kamera-vy**
- [ ] Kameran startar korrekt
- [ ] Overlay är läsbar
- [ ] Capture-knapp är tydlig
- [ ] Instruktioner visas baserat på träningsläge

### **Progress Tracking**
- [ ] Timer räknar korrekt
- [ ] Progress bar uppdateras
- [ ] Träffsäkerhet beräknas
- [ ] "Lyckades/Missade"-knappar fungerar

---

## 🚨 Vanliga problem och lösningar

### **Problem: "Kamerabehörighet krävs"**
**Lösning:**
- iOS: Gå till Inställningar > Expo Go > Kamera > Tillåt
- Android: Ge kamerabehörighet när appen frågar

### **Problem: "Kunde inte analysera bilden"**
**Möjliga orsaker:**
1. Backend körs inte → Starta `npm run dev` i backend/
2. Fel URL → Kontrollera API_URL i .env
3. Nätverksproblem → Testa med curl

**Debug:**
```bash
# Kontrollera att backend svarar
curl http://localhost:3000/health

# Kontrollera att analyze-endpoint finns
curl -X POST http://localhost:3000/api/training/analyze
# Förväntat: "No image provided" (vilket är OK)
```

### **Problem: "ML service unavailable"**
**Detta är normalt!** Backend använder simulerad data när ML-tjänsten inte körs.

---

## 📊 Prestandatester

### **Bilduppladdning**
- [ ] Bilder under 5MB laddas upp snabbt
- [ ] Timeout är 30 sekunder
- [ ] Felhantering fungerar

### **Analystid**
- [ ] Simulerad analys: < 1 sekund
- [ ] Med ML-tjänst: 2-5 sekunder
- [ ] Loading-indikator visas under analys

### **Navigation**
- [ ] Övergångar är smidiga
- [ ] Ingen lag mellan skärmar
- [ ] Tillbaka-knapp fungerar

---

## ✅ Acceptanskriterier

### **Minimum Viable Product (MVP)**
- [x] Användaren kan öppna appen
- [x] Användaren kan navigera mellan skärmar
- [x] Användaren kan starta en träningssession
- [x] Kameran öppnas i träningsläge
- [x] Användaren kan ta foton
- [x] Foton analyseras (simulerat eller riktigt)
- [x] Avstånd visas för användaren
- [x] Progress tracking fungerar
- [x] Användaren kan avsluta träning

### **Nästa iteration**
- [ ] Riktig ML-analys med objektdetektering
- [ ] Spara träningsdata i databas
- [ ] Användarautentisering
- [ ] Historik och statistik
- [ ] Social delning
- [ ] Achievements och badges

---

## 🎯 Testscenarios

### **Scenario 1: Ny användare**
1. Öppna appen första gången
2. Se välkomstskärm
3. Navigera till Träning
4. Starta första träningspasset
5. Ta första fotot
6. Se första analysen
7. Slutför första övningen

### **Scenario 2: Erfaren användare**
1. Öppna appen
2. Se sin statistik på hemskärmen
3. Starta avancerad träning
4. Använd alla tre träningslägena
5. Jämför resultat med tidigare pass

### **Scenario 3: Offline-läge**
1. Stäng av WiFi/mobil data
2. Öppna appen
3. Navigera mellan skärmar (ska fungera)
4. Försök ta foto (ska fungera)
5. Analys misslyckas (förväntat)
6. Felmeddelande visas

---

## 📝 Testrapport Mall

```markdown
## Test: [Namn på test]
**Datum:** 2025-10-13
**Testare:** [Ditt namn]
**Enhet:** [iPhone 14 / Android Pixel 7 / etc]

### Resultat
- [ ] Godkänd
- [ ] Misslyckad
- [ ] Delvis godkänd

### Anteckningar
[Beskriv vad som hände]

### Screenshots
[Bifoga screenshots om relevant]

### Nästa steg
[Vad behöver fixas?]
```

---

## 🎉 Lycka till med testningen!

Om du hittar buggar eller har förbättringsförslag, dokumentera dem och skapa issues i GitHub-repot.

**Happy testing!** 🧪✨
