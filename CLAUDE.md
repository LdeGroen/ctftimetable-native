# CLAUDE.md — CTF Timetable Native

Context voor Claude bij het werken aan dit project.

## Wat is dit?
React Native (Expo) versie van de CTF Timetable app. De webversie staat in een ander repo: `LdeGroen/ctftimetable`. Deze native versie is gestart op **2026-05-25** als migratie van de WebView-Android-app naar een echte native app voor iOS én Android.

## Stack
- **Expo** SDK (managed workflow)
- **React Navigation** (native stack)
- **AsyncStorage** voor persistentie (vervangt `localStorage`)
- **Expo Notifications** (vervangt de Android `AlarmScheduler`)
- **Expo Sharing / Speech / Clipboard / Linking**
- **lucide-react-native** voor icons
- **Oswald font** via `@expo-google-fonts/oswald`

## Backend
Laravel API op `https://backend.cafetheaterfestival.nl`. Endpoints onder `/api/public/{resource}` met `per_page` paginering. Identiek aan de webversie.

## Gedeelde bestanden met webversie
Deze bestanden zijn 1:1 gekopieerd uit `ctftimetable/src/`:
- `translations.js` — alle NL/EN strings
- `utils.js` — helper functies (parseDateForSorting, etc.)

Bij wijzigingen aan deze bestanden in de webversie: **handmatig syncen** naar dit repo.

## Architectuur

### Geen Tailwind
React Native ondersteunt geen Tailwind. Alle styling via `StyleSheet.create()` met waardes uit `src/theme.js`.

### Geen `<div>` / `<span>` / `className`
Vervang door `<View>` / `<Text>` / `style={}`.

### Storage is async
`localStorage.getItem()` → `await storage.getItem()`. Alle reads/writes zijn Promises.

### Navigatie
Via React Navigation. Geen URL routing zoals in de webversie — schermen worden gepushed/gepopped via `navigation.navigate(...)`.

### Deep linking
Geconfigureerd in `app.json` via `scheme: "ctftimetable"` + iOS associated domains + Android intent filters voor `timetable.cafetheaterfestival.nl`.

## Migratie status

Zie [README.md](./README.md) voor de volledige roadmap. Huidige fase: **Fase 0 — voorbereiding**.

### Roadmap fases
- **Fase 0** — setup (Expo init, dependencies, herbruikbare bestanden) ✅
- **Fase 1** — data & state (API, AsyncStorage cache, favorites) ✅
- **Fase 2** — kerncomponenten (PerformanceCard, filters, navigation) ✅
- **Fase 3** — schermen (Home, Timetable, Favorites, Detail, Routes) ✅
- **Fase 4** — native features (notifications, sharing, TTS) ✅
- **Fase 5** — iOS/Android pariteit (icons, splash, deep links, animaties) ✅
- **Fase 6** — release (EAS Build, stores) ✅

## Status: alle fases afgerond
De migratie is in code-vorm compleet. Wat nog moet gebeuren is operationeel:
1. `eas init` runnen om EAS project ID te genereren (vul `app.json` placeholders in)
2. Eerste production build via `eas build --platform all --profile production`
3. Apple Developer + Google Play Console setup (kosten + paperwork)
4. Eerste store submissions
5. Testen op fysieke toestellen met development build

Zie [RELEASE.md](./RELEASE.md) voor stap-voor-stap instructies.

## Conventies
- Mappen lowercase, bestanden PascalCase voor componenten/screens
- Geen default exports voor utils, wél voor screens/components
- Comments in Nederlands (consistent met webversie)
- Theme tokens uit `src/theme.js` gebruiken — geen hardcoded hex codes

## Productie release
Via **EAS Build** (geen Mac nodig voor iOS):
```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```
