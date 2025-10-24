# ☁️ CLOUD SETUP - Steg för Steg

## 🎯 Vad vi ska göra (30 minuter):
1. ✅ MongoDB Atlas (gratis databas)
2. ✅ Railway.app (gratis backend hosting)
3. ✅ Cloudinary (gratis bildlagring)

---

## 📝 STEG 1: MongoDB Atlas (5 minuter)

### 1.1 Skapa konto
1. Gå till: https://www.mongodb.com/cloud/atlas/register
2. Klicka "Sign Up Free"
3. Använd Google/GitHub eller skapa konto med email

### 1.2 Skapa Cluster
1. Välj **"M0 Sandbox"** (GRATIS)
2. Provider: **AWS**
3. Region: **Välj närmaste** (t.ex. Frankfurt för Sverige)
4. Cluster Name: `boule-petanque`
5. Klicka **"Create Deployment"**

### 1.3 Skapa Database User
1. När prompten dyker upp, skapa username & password
   - Username: `boule-admin`
   - Password: **Generera stark password (spara den!)**
   - Klicka **"Create Database User"**

### 1.4 Whitelist IP Address
1. Under "Network Access"
2. Klicka **"Add IP Address"**
3. Välj **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Klicka **"Confirm"**

### 1.5 Hämta Connection String
1. Klicka **"Connect"** på ditt cluster
2. Välj **"Drivers"**
3. Välj **"Node.js"** version 4.1 or later
4. Kopiera connection string (ser ut så här):
   ```
   mongodb+srv://boule-admin:<password>@boule-petanque.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **BYT UT `<password>`** mot ditt riktiga password
6. **SPARA** denna string - vi behöver den snart!

✅ **KLART!** MongoDB Atlas är nu setup.

---

## 🚂 STEG 2: Railway.app (10 minuter)

### 2.1 Skapa konto
1. Gå till: https://railway.app
2. Klicka **"Start a New Project"**
3. Logga in med GitHub (rekommenderat)

### 2.2 Skapa nytt projekt
1. Klicka **"New Project"**
2. Välj **"Deploy from GitHub repo"**
3. Anslut ditt GitHub-konto om du inte gjort det
4. Välj repo: **"Boule-Petanque-Training-App"**

### 2.3 Konfigurera backend
1. Railway kommer att hitta din `backend` folder
2. Klicka på backend-servicen
3. Gå till **"Settings"**
4. Under "Root Directory", sätt: `/backend`
5. Under "Start Command", sätt: `npm start`

### 2.4 Lägg till Environment Variables
Klicka på **"Variables"** tab och lägg till:

```bash
PORT=3000
NODE_ENV=production

# MongoDB (använd din connection string från steg 1!)
MONGODB_URI=mongodb+srv://boule-admin:DITT_PASSWORD@boule-petanque.xxxxx.mongodb.net/boule-petanque?retryWrites=true&w=majority

# JWT Secret (generera en säker nyckel)
JWT_SECRET=din_super_hemliga_nyckel_ändra_denna
JWT_EXPIRE=7d

# CORS (kommer att uppdateras senare med Expo URL)
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

### 2.5 Deploya
1. Railway deployer automatiskt!
2. Vänta 2-3 minuter
3. Klicka på **"Settings"** → **"Domains"**
4. Klicka **"Generate Domain"**
5. **KOPIERA URL** (t.ex. `boule-petanque-production.up.railway.app`)
6. **SPARA denna URL** - vi behöver den!

### 2.6 Testa att det fungerar
Öppna i browser:
```
https://DIN-RAILWAY-URL.railway.app/api/health
```

Om du ser JSON-svar = **FUNKAR!** ✅

---

## 📸 STEG 3: Cloudinary (5 minuter)

### 3.1 Skapa konto
1. Gå till: https://cloudinary.com/users/register_free
2. Klicka **"Sign Up For Free"**
3. Fyll i email, password, etc.

### 3.2 Hämta API credentials
1. Efter inloggning, gå till **"Dashboard"**
2. Du ser:
   - **Cloud Name**: (t.ex. `dxyz123abc`)
   - **API Key**: (t.ex. `123456789012345`)
   - **API Secret**: (klicka "Reveal" för att se)
3. **KOPIERA alla tre** - spara dem!

### 3.3 Lägg till i Railway
1. Gå tillbaka till Railway
2. Klicka på din backend-service
3. Gå till **"Variables"**
4. Lägg till:
```bash
CLOUDINARY_CLOUD_NAME=ditt_cloud_name
CLOUDINARY_API_KEY=din_api_key
CLOUDINARY_API_SECRET=din_api_secret
```
5. Railway re-deployer automatiskt!

✅ **KLART!** Cloudinary är nu setup.

---

## 📱 STEG 4: Uppdatera Frontend (2 minuter)

Nu ska vi uppdatera frontend så den pratar med din backend på Railway!

### 4.1 Skapa/uppdatera .env
```bash
cd /Users/admin/Agentic\ IDE/Boule-Petanque-Training-App/frontend

# Skapa .env fil med din Railway URL
cat > .env << EOF
API_URL=https://DIN-RAILWAY-URL.railway.app/api
CLOUDINARY_CLOUD_NAME=ditt_cloud_name
EOF
```

**BYT UT:**
- `DIN-RAILWAY-URL.railway.app` med din faktiska Railway URL
- `ditt_cloud_name` med ditt Cloudinary cloud name

---

## ✅ FÄRDIG! Sammanfattning

### Du har nu:
```
✅ MongoDB Atlas (databas)
   URL: mongodb+srv://boule-admin:xxx@boule-petanque.xxxxx.mongodb.net
   
✅ Railway (backend hosting)
   URL: https://xxx.railway.app
   
✅ Cloudinary (bildlagring)
   Cloud Name: xxx
   API Key: xxx
   API Secret: xxx
   
✅ Frontend .env uppdaterad
```

---

## 🧪 TESTA ATT ALLT FUNGERAR

### Test 1: Backend Health Check
```bash
curl https://DIN-RAILWAY-URL.railway.app/api/health
```
Förväntat svar: `{"status":"ok"}`

### Test 2: Starta Frontend
```bash
cd frontend
npm start
```

### Test 3: Öppna på telefon
1. Scanna QR-koden med Expo Go
2. Appen ska nu kunna prata med din backend!

---

## 💰 KOSTNAD

```
MongoDB Atlas M0:     $0/månad ✅
Railway Free Tier:    $0/månad (500h/månad) ✅
Cloudinary Free:      $0/månad (25 credits) ✅
--------------------------------
TOTAL:                $0/månad 🎉
```

---

## 🆘 TROUBLESHOOTING

### Problem: "Unable to connect to database"
**Lösning:**
1. Kontrollera att MongoDB connection string är korrekt
2. Kontrollera att password inte har specialtecken som behöver URL-encoding
3. Kontrollera att IP whitelist är satt till 0.0.0.0/0

### Problem: "Network request failed" i appen
**Lösning:**
1. Kontrollera att API_URL i frontend/.env är korrekt
2. Testa backend URL i browser först
3. Kontrollera att CORS_ORIGIN i Railway är satt till `*`

### Problem: Railway deployment failar
**Lösning:**
1. Kontrollera att Root Directory är `/backend`
2. Kontrollera att `npm install` och `npm start` fungerar lokalt
3. Kolla Railway logs för felmeddelanden

---

## 📞 NÄSTA STEG

När allt detta fungerar kan vi:
1. Implementera backend API-endpoints
2. Testa med riktiga data
3. Bygga AI/ML-delen
4. Deploya till produktion

**Grattis! Du har nu en molnbaserad infrastruktur! ☁️🎉**
