# HANDOVER – Boule Pétanque Training App

## Snabbstart
```bash
cd web-app
npm install
npm start        # localhost:3000
npm run build    # production build
```

## Deploy
```bash
vercel --prod --yes   # från repo-root
```
Live: https://boule-petanque-training-app.vercel.app

## Arkitektur
- **CRA (Create React App)** med React 18.2
- **Ingen backend** – all data i localStorage via `src/firebase.js`
- **react-router-dom v7** – SPA med 3 routes
- **Vercel** – statisk deploy med SPA rewrite

## Kodbas
All aktiv kod finns i `web-app/src/`:

| Fil | Ansvar |
|-----|--------|
| `App.js` | Allt UI: routes, 3 page-komponenter (Landing, Training, History), useTheme hook, achievements-logik |
| `App.css` | All styling med CSS custom properties för light/dark mode |
| `firebase.js` | Data-layer: localStorage CRUD för stats, sessions, achievements, challenges, games |
| `index.js` | Entry point med BrowserRouter |

## Datamodell (localStorage)
| Nyckel | Innehåll |
|--------|----------|
| `boule_stats` | `{ accuracy, totalThrows, totalSessions, wins, streak, lastTrainingDate, level, points, pointsToNextLevel }` |
| `boule_sessions` | Array av `{ id, date, throws, accuracy, type }` |
| `boule_achievements` | Array av `{ id, name, icon, points, unlocked, requirement }` |
| `boule_challenges` | `{ date, challenges: [...] }` – regenereras dagligen |
| `boule_games` | Array av spel (ej implementerat i UI ännu) |
| `boule_theme` | `"light"` eller `"dark"` |

## Routes
| Path | Komponent | Funktion |
|------|-----------|----------|
| `/` | LandingPage | Hero, features, CTA |
| `/train` | TrainingPage | Kastträning med simulering, achievements, streak |
| `/history` | HistoryPage | SVG-graf + sessionslista |

## Dark Mode
- CSS-variabler i `:root` (light) och `[data-theme="dark"]`
- `useTheme()` hook sätter attribut på `<html>` och sparar i localStorage
- Toggle-knapp fixed top-right

## Kända begränsningar
- **App.js är monolitisk** (~470 rader) – bör splittas i separata komponenter
- **Spelmodul** finns i dataService men saknar UI-route
- **Utmaningar** och **Achievements** saknar egna routes (logik finns)
- **Grafen** är enkel SVG – ingen interaktivitet (hover, zoom)
- **Inga tester** – bör lägga till med React Testing Library
- **Inga felgränser** (Error Boundaries)
- **PWA** finns i web-demo/ men inte i web-app/

## Git
- **Remote:** https://github.com/Mats6102hamberg/Boule-Petanque-Training-App.git
- **Branch:** main
- **Senaste commit:** `bf0af74` – feat: Vercel deploy, react-router, träningshistorik med graf och dark mode

## Mappar (ej aktiva)
Dessa mappar finns i repot men är inte del av den aktiva appen:
- `frontend/` – gammal React Native-kod
- `backend/` – gammal Express-backend
- `ai-ml/` – ML-modeller (framtida)
- `database/` – DB-scheman
- `web-demo/` – statisk HTML-demo med PWA
- `public/` – statisk landningssida
- `docs/` – dokumentation
