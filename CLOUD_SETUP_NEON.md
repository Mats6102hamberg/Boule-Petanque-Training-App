# ☁️ CLOUD SETUP - Med Neon PostgreSQL (GRATIS!)

## 🎯 Vad vi ska göra (20 minuter):
1. ✅ Neon.tech (gratis PostgreSQL databas)
2. ✅ Railway.app (gratis backend hosting)
3. ✅ Cloudinary (gratis bildlagring)

---

## 🐘 STEG 1: Neon PostgreSQL (3 minuter)

### 1.1 Skapa konto
1. Gå till: https://console.neon.tech/signup
2. Klicka **"Sign up with GitHub"** (rekommenderat och snabbast!)
3. Eller använd Google/email

### 1.2 Skapa Project
1. Efter inloggning, klicka **"Create a project"**
2. Project name: `boule-petanque`
3. Database name: `boule_petanque_db`
4. Region: **Välj närmaste** (Europe (Frankfurt) för Sverige)
5. Klicka **"Create project"**

### 1.3 Hämta Connection String
1. Efter projektet är skapat ser du **"Connection Details"**
2. Välj **"Pooled connection"** (bättre för production)
3. Du ser en connection string som ser ut så här:
   ```
   postgresql://username:password@ep-cool-name-123456.eu-central-1.aws.neon.tech/boule_petanque_db?sslmode=require
   ```
4. **KOPIERA hela connection string** och spara den!
5. **VIKTIGT:** Klicka på "Show password" och spara lösenordet separat också

✅ **KLART!** Neon PostgreSQL är nu setup.

**FÖRDELAR MED NEON:**
- ✅ Verklig gratis tier (ingen kreditkort behövs!)
- ✅ 512 MB lagring gratis
- ✅ Auto-scaling
- ✅ Branching (som Git för din databas!)
- ✅ Mycket snabbare än MongoDB för vissa queries

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

# Database (PostgreSQL via Neon - använd din connection string!)
DATABASE_URL=postgresql://username:password@ep-cool-name-123456.eu-central-1.aws.neon.tech/boule_petanque_db?sslmode=require

# JWT Secret (generera en säker nyckel)
JWT_SECRET=din_super_hemliga_nyckel_minst_32_tecken_long
JWT_EXPIRE=7d

# CORS (tillåter alla under development)
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

**VIKTIGT:** Byt ut `DATABASE_URL` med din faktiska Neon connection string!

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
3. Använd Google/GitHub eller email

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

## 🔄 STEG 4: Uppdatera Backend till PostgreSQL (5 minuter)

**Vi behöver byta från MongoDB (Mongoose) till PostgreSQL (Prisma/Sequelize)**

Jag kommer att hjälpa dig med detta! Men först - låt oss sätta upp infrastrukturen.

---

## 📱 STEG 5: Uppdatera Frontend (2 minuter)

```bash
cd /Users/admin/Agentic\ IDE/Boule-Petanque-Training-App/frontend

# Skapa .env fil
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
✅ Neon PostgreSQL (databas)
   URL: postgresql://xxx@ep-xxx.eu-central-1.aws.neon.tech/boule_petanque_db
   
✅ Railway (backend hosting)
   URL: https://xxx.railway.app
   
✅ Cloudinary (bildlagring)
   Cloud Name: xxx
   
✅ Frontend .env uppdaterad
```

---

## 💰 KOSTNAD

```
Neon PostgreSQL Free:   $0/månad (512 MB) ✅
Railway Free Tier:      $0/månad (500h) ✅
Cloudinary Free:        $0/månad (25 credits) ✅
----------------------------------------
TOTAL:                  $0/månad 🎉
```

---

## 🆘 VARFÖR NEON ÄR BÄTTRE ÄN MONGODB:

### ✅ FÖRDELAR:
1. **Verkligt gratis** - inget kreditkort
2. **PostgreSQL** - mer strukturerat och kraftfullt
3. **Auto-scaling** - anpassar sig automatiskt
4. **Branching** - testa ändringar utan risk
5. **Snabbare** för komplexa queries
6. **ACID-compliant** - säkrare transactions

### 📊 JÄMFÖRELSE:
```
MongoDB Atlas Free:  ❌ Finns inte längre
Neon Free:          ✅ 512 MB, pooling, branching
```

---

## 🔄 NÄSTA: Migrera från MongoDB till PostgreSQL

Vi behöver uppdatera backend-koden från Mongoose (MongoDB) till Prisma (PostgreSQL).

**Jag hjälper dig med detta i nästa steg!**

För nu - fokusera på att sätta upp Neon och Railway!

---

## 📞 REDO ATT BÖRJA?

**STEG 1:** Öppna https://console.neon.tech/signup

**STEG 2:** Skapa konto med GitHub (tar 30 sekunder)

**STEG 3:** Skapa project "boule-petanque"

**När du är klar - säg "klart" så fortsätter vi!** 🚀

---

## 💡 EXTRA: Varför PostgreSQL är perfekt för din app

Din app behöver:
- ✅ Users (relationer mellan users och teams)
- ✅ Training sessions (strukturerad data)
- ✅ Games & Matches (komplexa relationships)
- ✅ Statistics (aggregations)
- ✅ Achievements (många-till-många relationer)

**PostgreSQL hanterar allt detta MYCKET bättre än MongoDB!**

Plus: Neon ger dig gratis backup, branching, och auto-scaling! 🎉
