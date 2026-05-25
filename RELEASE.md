# Release Guide

Stap-voor-stap handleiding om de CTF Timetable Native app te releasen op Google Play Store en Apple App Store via **EAS Build** (Expo Application Services).

---

## Eenmalige setup

### 1. Expo account + EAS CLI

```bash
npm install -g eas-cli
eas login
```

Maak een account aan op [expo.dev](https://expo.dev) als je dat nog niet hebt.

### 2. Project koppelen aan EAS

In de project root:

```bash
eas init
```

Dit:
- Maakt een EAS project aan op expo.dev
- Vult `extra.eas.projectId` in `app.json` in (vervang de `REPLACE_WITH_EAS_PROJECT_ID` placeholder)
- Updatet ook de `updates.url` voor OTA updates

> **Tip**: commit `app.json` na deze stap, zodat anderen het project niet opnieuw aanmaken.

### 3. Credentials configureren

#### Android
```bash
eas credentials --platform android
```
- Kies "Production": EAS genereert een nieuwe upload keystore voor je
- Bewaart de keystore veilig op expo.dev (handig — geen lokaal beheer)

#### iOS
```bash
eas credentials --platform ios
```
- Vereist een **Apple Developer account** ($99/jaar)
- EAS regelt de Apple distribution certificate en provisioning profile
- Voor automatische submission: vul `ascAppId` en `appleTeamId` in `eas.json` in

---

## Een release maken

### Stap 1: Versie ophogen

In `app.json`:
```json
"version": "1.0.1"
```

De `versionCode` (Android) en `buildNumber` (iOS) worden door EAS automatisch verhoogd via `autoIncrement: true` in `eas.json`.

### Stap 2: Build maken

#### Android (Play Store)
```bash
eas build --platform android --profile production
```
- Output: `.aab` (Android App Bundle)
- Bouwduur: ±15-20 min op EAS servers
- Je krijgt een download link wanneer klaar

#### iOS (App Store)
```bash
eas build --platform ios --profile production
```
- Output: `.ipa`
- Bouwduur: ±20-25 min
- Geen Mac nodig — EAS draait de Xcode build voor je

#### Allebei tegelijk
```bash
eas build --platform all --profile production
```

### Stap 3: Submitten naar de stores

#### Android
1. Eenmalig: upload [Google Play service account key](https://docs.expo.dev/submit/android/) naar `./secrets/play-store-key.json` (in `.gitignore`!)
2. Submit:
```bash
eas submit --platform android --profile production --latest
```
3. Build verschijnt als "Draft" in Play Console → tracks → Production
4. Vul release notes in (zie sjabloon onderaan), promote naar publiek

#### iOS
```bash
eas submit --platform ios --profile production --latest
```
1. Build verschijnt in App Store Connect → TestFlight
2. Test eerst via TestFlight met interne testers
3. Vul App Store info in (screenshots, description, privacy)
4. Verstuur ter review

---

## Tijdens ontwikkeling

### Development build (met dev client)

In plaats van Expo Go kun je je eigen dev build installeren — dan werken alle native modules (notifications, etc.) écht.

```bash
eas build --platform android --profile development
```

Installeer de APK op je telefoon, scan dan de QR uit `npm start` zoals normaal.

### Preview build (interne distributie)

Voor delen met testers zonder Play Store:

```bash
eas build --platform android --profile preview
```

Geeft een `.apk` die je via een link kunt installeren (`adb install`, drive share, etc.).

---

## OTA updates (Over-The-Air)

Voor kleine JS-wijzigingen hoef je geen nieuwe store-build te doen. Push een update via EAS Update:

```bash
npm install -g eas-cli  # als nog niet geïnstalleerd
eas update --branch production --message "Fix typo in voorstelling-titel"
```

Gebruikers zien de update bij de volgende app-start.

**Werkt alleen voor**: JS-wijzigingen (componenten, logica, tekst)
**Vereist nieuwe build**: native modules toevoegen/verwijderen, `app.json` plugins, version bump

---

## Release Notes sjabloon

### Google Play (max 500 tekens per taal)

**NL:**
```
Versie X.Y.Z verbeteringen:
- [Belangrijkste user-facing wijziging]
- Stabiliteit en performance verbeteringen
```

**EN:**
```
Version X.Y.Z improvements:
- [Main user-facing change]
- Stability and performance improvements
```

### Apple App Store (max 4000 tekens)

Zelfde structuur, ruimte voor meer detail.

---

## Troubleshooting

**"Outdated keystore"** — je hebt waarschijnlijk lokaal handmatig credentials veranderd. Run `eas credentials --platform android` en reset.

**"App Store rejected"** — kijk in `eas submit` output, of in App Store Connect → Activity. Meest voorkomende oorzaak: ontbrekende privacy declaratie. Check `app.json` voor `ios.infoPlist.NS*UsageDescription` strings.

**OTA update komt niet door** — controleer dat de gebruiker:
1. De app minstens 1× heeft geopend ná de update push
2. Op dezelfde `channel` zit (production / preview)
3. Op dezelfde `runtimeVersion` zit als de gepublishde update

---

## Snelle commando-cheat-sheet

```bash
eas login                                          # eenmalig
eas init                                           # eenmalig per project
eas build --platform android --profile production  # Android Play Store build
eas build --platform ios --profile production      # iOS App Store build
eas submit --platform android --latest             # uploaden naar Play Console
eas submit --platform ios --latest                 # uploaden naar App Store Connect
eas update --branch production --message "..."     # OTA update
eas build:list                                     # builds bekijken
```
