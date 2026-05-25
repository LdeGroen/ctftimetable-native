// Definitie van de safety/toegankelijkheids-iconen.
// Translation keys: t.tooltipWheelchair, t.wheelchairAccessible, etc.

import { translations } from './translations';

const BASE = 'https://pub-36abfb48eca14eb8b366a0211191ef0e.r2.dev/legacy';

export const SAFETY_ICONS = [
    { key: 'wheelchairAccessible', url: `${BASE}/CTF-ICONS_Rolstoeltoegankelijk-kopie.png` },
    { key: 'diningFacility', url: `${BASE}/CTF-ICONS_Eetmogelijkheid-kopie.png` },
    { key: 'suitableForChildren', url: `${BASE}/CTF-ICONS_Geschikt-Voor-Kinderen-kopie.png` },
    { key: 'dutchLanguage', url: `${BASE}/CTF-ICONS_NL-kopie.png` },
    { key: 'englishLanguage', url: `${BASE}/CTF-ICONS_ENG-kopie.png` },
    { key: 'dialogueFree', url: `${BASE}/CTF-ICONS_DIALOGUE-FREE-kopie.png` },
    { key: 'hasNGT', url: `${BASE}/vgtliggend-1-removebg-preview.png` },
];

/** Met label/tooltip uit translations (voor accessibility labels). */
export function getSafetyIconsWithLabels(language) {
    const t = translations[language]?.common ?? {};
    return SAFETY_ICONS.map(icon => ({
        ...icon,
        label: t[icon.key] || icon.key,
        tooltip: t[`tooltip${icon.key.charAt(0).toUpperCase()}${icon.key.slice(1)}`] || '',
    }));
}
