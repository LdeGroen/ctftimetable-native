// Notification helper — wrapper rond expo-notifications.
// Beheert permissies, scheduling, en cancellatie. Werkt op iOS én Android.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { parseDateForSorting } from './utils';
import { getJSON, setJSON, storageKeys } from './storage';

// Foreground notification gedrag: toon banner + speel geluid.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const DEFAULT_MINUTES_BEFORE = 15;

/** Vraag notificatie-permissie aan de gebruiker. */
export async function requestPermissions() {
    if (Platform.OS === 'android') {
        // Op Android moet je een channel aanmaken om geluid/vibratie te krijgen.
        await Notifications.setNotificationChannelAsync('default', {
            name: 'CTF voorstellingen',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#1a5b64',
        });
    }
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

/** Heeft de gebruiker al toestemming gegeven? */
export async function hasPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
}

/**
 * Plan een lokale notificatie voor een voorstelling.
 * Returnt de Expo notification ID (nodig om later te cancellen).
 * Geeft null terug als de tijd al verstreken is.
 */
export async function schedulePerformanceNotification(performance, minutesBefore = DEFAULT_MINUTES_BEFORE, language = 'nl') {
    if (!performance.date || !performance.time || performance.date === 'Algemeen' || performance.date === 'N/A') {
        return null;
    }

    const date = parseDateForSorting(performance.date);
    if (!date || isNaN(date.getTime())) return null;

    const [hh, mm] = performance.time.split(':').map(Number);
    date.setHours(hh, mm, 0, 0);
    const triggerDate = new Date(date.getTime() - minutesBefore * 60 * 1000);

    if (triggerDate.getTime() <= Date.now()) return null;

    const fullTitle = performance.artist ? `${performance.artist} — ${performance.title}` : performance.title;
    const body = language === 'en'
        ? `Starts at ${performance.time} at ${performance.location}`
        : `Begint om ${performance.time} op ${performance.location}`;

    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: fullTitle,
            body,
            data: { performanceId: performance.originalPerformanceId, executionId: performance.id },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });

    return id;
}

/** Cancel een geplande notificatie. */
export async function cancelNotification(notificationId) {
    if (!notificationId) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (err) {
        console.warn('cancelNotification faalde', err);
    }
}

/** Cancel alle geplande notificaties (gebruikt bij settings-reset). */
export async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Synchroniseer geplande notificaties met de huidige favorieten lijst.
 * Voegt notificaties toe voor nieuwe favorieten, cancelt notificaties voor
 * verwijderde favorieten. Idempotent — veilig om vaak aan te roepen.
 */
export async function syncFavoriteNotifications({ favorites, timetableData, language, minutesBefore = DEFAULT_MINUTES_BEFORE }) {
    const granted = await hasPermissions();
    if (!granted) return;

    const stored = (await getJSON(storageKeys.SCHEDULED_NOTIFICATIONS)) || {};
    // stored = { [performanceId]: { notificationId, executionId, timestamp } }

    const favSet = new Set(favorites);

    // 1. Cancel notifications waarvan de favoriet is verwijderd
    for (const performanceId of Object.keys(stored)) {
        if (!favSet.has(performanceId)) {
            await cancelNotification(stored[performanceId].notificationId);
            delete stored[performanceId];
        }
    }

    // 2. Plan notifications voor nieuwe favorieten
    // Per voorstelling pakken we de eerstvolgende uitvoering.
    for (const performanceId of favSet) {
        if (stored[performanceId]) continue;

        // Vind eerstvolgende toekomstige uitvoering
        const occurrences = timetableData
            .filter(p => p.originalPerformanceId === performanceId && p.date !== 'Algemeen' && p.time)
            .map(p => {
                const d = parseDateForSorting(p.date);
                if (!d) return null;
                const [hh, mm] = p.time.split(':').map(Number);
                d.setHours(hh, mm, 0, 0);
                return { perf: p, ts: d.getTime() };
            })
            .filter(o => o && o.ts > Date.now())
            .sort((a, b) => a.ts - b.ts);

        if (occurrences.length === 0) continue;

        const next = occurrences[0].perf;
        const notificationId = await schedulePerformanceNotification(next, minutesBefore, language);
        if (notificationId) {
            stored[performanceId] = {
                notificationId,
                executionId: next.id,
                timestamp: occurrences[0].ts,
            };
        }
    }

    await setJSON(storageKeys.SCHEDULED_NOTIFICATIONS, stored);
}

/**
 * Plan algemene notificaties uit de backend (admin pushes).
 * Deze worden meegegeven met de timetable data.
 */
export async function scheduleGeneralNotifications(notifications, language = 'nl') {
    const granted = await hasPermissions();
    if (!granted) return;

    for (const notif of notifications) {
        if (!notif.date) continue;
        const trigger = new Date(notif.date);
        if (isNaN(trigger.getTime()) || trigger.getTime() <= Date.now()) continue;

        const body = language === 'en' ? (notif.text_en || notif.text_nl) : (notif.text_nl || notif.text_en);
        if (!body) continue;

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Café Theater Festival',
                    body,
                    data: { url: notif.url, openInBrowser: notif.openInBrowser, generalId: notif.id },
                },
                trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
                identifier: `general-${notif.id}`,
            });
        } catch (err) {
            console.warn('scheduleGeneralNotifications failed for', notif.id, err);
        }
    }
}
