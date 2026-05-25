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

## Release maken

Zie [RELEASE.md](./RELEASE.md) voor de complete release guide (EAS Build, Play Store, App Store, OTA updates).

Snelle commands:
```bash
eas build --platform android --profile production   # Android AAB
eas build --platform ios --profile production       # iOS IPA
eas submit --platform android --latest              # naar Play Store
eas submit --platform ios --latest                  # naar App Store
eas update --branch production --message "..."      # OTA update zonder build
```

## Roadmap status

- ✅ Fase 0 — Expo setup
- ✅ Fase 1 — Data fetching + AsyncStorage cache + favorites
- ✅ Fase 2 — PerformanceCard, CrowdMeter, filters, search
- ✅ Fase 3 — Detail-scherm, block view, routes
- ✅ Fase 4 — Notificaties + TTS + settings
- ✅ Fase 5 — Branding, deep links, animaties, polish
- ✅ Fase 6 — EAS Build configuratie + CI workflows
