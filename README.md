# CTF Timetable — Native

Native iOS & Android versie van de Café Theater Festival timetable, gebouwd met **Expo** + **React Native**.

De webversie blijft beschikbaar via [github.com/LdeGroen/ctftimetable](https://github.com/LdeGroen/ctftimetable).

---

## Project setup

### Vereisten
- Node.js 20+
- Expo Go app op je telefoon (voor lokaal testen zonder build)
- Voor productie builds: Expo account + EAS CLI

### Installeren
```bash
npm install
```

### Lokaal draaien
```bash
npm start              # opent Expo dev server, scan QR code met Expo Go app
npm run android        # start in Android emulator
npm run ios            # start in iOS simulator (alleen op Mac)
```

---

## Project structuur

```
src/
├── screens/           # Schermen (HomeScreen, TimetableScreen, ...)
├── components/        # Herbruikbare componenten
├── api.js             # API laag, fetch helpers
├── storage.js         # AsyncStorage wrapper (vervangt localStorage)
├── theme.js           # Kleuren, spacing, typografie
├── translations.js    # Nederlands/Engels strings (gedeeld met webversie)
└── utils.js           # Helper functies (gedeeld met webversie)
App.js                 # Root component met React Navigation setup
app.json               # Expo configuratie
```

---

## Backend

Dezelfde Laravel API als de webversie: `https://backend.cafetheaterfestival.nl`.
Configureerbaar via `.env`:
```
EXPO_PUBLIC_API_URL=https://backend.cafetheaterfestival.nl
```

---

## Roadmap

Zie de [migratie-roadmap](#) — momenteel in **Fase 0: setup**.
