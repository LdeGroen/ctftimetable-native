// AppContext — globale app-state: timetable data, favorites, language, loading.
// Vervangt de losse useState calls die in de webversie in app.js stonden.

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import * as Localization from 'expo-localization';

import { fetchAndBuildTimetable } from '../data';
import { getJSON, setJSON, getItem, setItem, storageKeys } from '../storage';
import {
    requestPermissions as requestNotificationPermissions,
    hasPermissions as hasNotificationPermissions,
    syncFavoriteNotifications,
    scheduleGeneralNotifications,
    cancelAllNotifications,
} from '../notifications';

const NOTIF_PREFS_KEY = 'ctfNotificationPrefs';

const AppContext = createContext(null);

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minuten

export function AppProvider({ children }) {
    const [timetableData, setTimetableData] = useState([]);
    const [eventInfoMap, setEventInfoMap] = useState({});
    const [uniqueEvents, setUniqueEvents] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [favorites, setFavorites] = useState(new Set());
    const [language, setLanguage] = useState('nl');
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [error, setError] = useState(null);
    const [notifPrefs, setNotifPrefs] = useState({ enabled: false, minutesBefore: 15 });
    const [notifPermission, setNotifPermission] = useState(false);

    /** Verwerk een verse data-payload (uit cache of API). */
    const applyData = useCallback((payload) => {
        if (!payload) return;
        setTimetableData(payload.performances || []);
        setEventInfoMap(payload.eventInfoMap || {});
        setUniqueEvents(payload.uniqueEvents || []);
        setRoutes(payload.routes || []);
        setNotifications(payload.notifications || []);
    }, []);

    /** Haal verse data op van de backend en cache het. */
    const refresh = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true);
        try {
            const fresh = await fetchAndBuildTimetable();
            applyData(fresh);
            setError(null);
            setIsOffline(false);

            await setJSON(storageKeys.TIMETABLE_CACHE, {
                ...fresh,
                timestamp: Date.now(),
            });
        } catch (err) {
            console.warn('refresh() faalde:', err);
            // Geen cache én geen verbinding: error tonen.
            // Wel een cache: gewoon offline-modus.
            const cached = await getJSON(storageKeys.TIMETABLE_CACHE);
            if (cached) {
                setIsOffline(true);
            } else {
                setError(err?.name === 'AbortError' ? 'timeout' : 'loading');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [applyData]);

    /** Eerste laad: probeer cache, daarna eventueel achtergrond-refresh. */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            // 1. Taal en favorieten uit storage
            const storedLang = await getItem(storageKeys.LANGUAGE);
            if (storedLang) {
                setLanguage(storedLang);
            } else {
                const deviceLocale = Localization.getLocales()?.[0]?.languageCode;
                setLanguage(deviceLocale === 'nl' ? 'nl' : 'en');
            }

            const storedFavs = await getJSON(storageKeys.FAVORITES);
            if (Array.isArray(storedFavs)) {
                setFavorites(new Set(storedFavs));
            }

            const storedPrefs = await getJSON(NOTIF_PREFS_KEY);
            if (storedPrefs) setNotifPrefs({ ...notifPrefs, ...storedPrefs });

            const perm = await hasNotificationPermissions();
            setNotifPermission(perm);

            // 2. Cache lezen
            const cached = await getJSON(storageKeys.TIMETABLE_CACHE);
            if (cancelled) return;

            const cacheAge = cached?.timestamp ? Date.now() - cached.timestamp : Infinity;
            const cacheIsFresh = cacheAge < CACHE_TTL_MS;

            if (cached) {
                applyData(cached);
                setLoading(false);
                // Cache toonbaar — refresh in achtergrond als hij stale is.
                if (!cacheIsFresh) {
                    refresh({ silent: true });
                }
            } else {
                // Geen cache: blokkerende fetch.
                await refresh();
            }
        })();
        return () => { cancelled = true; };
    }, [applyData, refresh]);

    /** Favoriet toggelen — persist meteen in storage. */
    const toggleFavorite = useCallback(async (performanceId) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(performanceId)) next.delete(performanceId);
            else next.add(performanceId);
            setJSON(storageKeys.FAVORITES, Array.from(next));
            return next;
        });
    }, []);

    /** Taal wisselen — persist meteen in storage. */
    const changeLanguage = useCallback(async (lang) => {
        setLanguage(lang);
        await setItem(storageKeys.LANGUAGE, lang);
    }, []);

    /** Notificaties aan/uit zetten — vraagt indien nodig permissie. */
    const setNotificationsEnabled = useCallback(async (enabled) => {
        if (enabled) {
            const granted = await requestNotificationPermissions();
            setNotifPermission(granted);
            if (!granted) return false;
        } else {
            await cancelAllNotifications();
        }
        const next = { ...notifPrefs, enabled };
        setNotifPrefs(next);
        await setJSON(NOTIF_PREFS_KEY, next);
        return true;
    }, [notifPrefs]);

    /** Minutes-before instellen (5, 10, 15, 30, 60). */
    const setMinutesBefore = useCallback(async (minutes) => {
        const next = { ...notifPrefs, minutesBefore: minutes };
        setNotifPrefs(next);
        await setJSON(NOTIF_PREFS_KEY, next);
    }, [notifPrefs]);

    /** Sync notifications wanneer favorieten, data of prefs wijzigen. */
    useEffect(() => {
        if (!notifPrefs.enabled || !notifPermission || timetableData.length === 0) return;
        syncFavoriteNotifications({
            favorites: Array.from(favorites),
            timetableData,
            language,
            minutesBefore: notifPrefs.minutesBefore,
        }).catch(err => console.warn('syncFavoriteNotifications failed', err));
    }, [favorites, timetableData, language, notifPrefs, notifPermission]);

    /** Algemene notificaties (admin pushes) plannen wanneer data verandert. */
    useEffect(() => {
        if (!notifPermission || notifications.length === 0) return;
        scheduleGeneralNotifications(notifications, language)
            .catch(err => console.warn('scheduleGeneralNotifications failed', err));
    }, [notifications, notifPermission, language]);

    const value = useMemo(() => ({
        timetableData,
        eventInfoMap,
        uniqueEvents,
        routes,
        notifications,
        favorites,
        language,
        loading,
        isOffline,
        error,
        notifPrefs,
        notifPermission,
        refresh,
        toggleFavorite,
        changeLanguage,
        setNotificationsEnabled,
        setMinutesBefore,
    }), [
        timetableData, eventInfoMap, uniqueEvents, routes, notifications,
        favorites, language, loading, isOffline, error,
        notifPrefs, notifPermission,
        refresh, toggleFavorite, changeLanguage,
        setNotificationsEnabled, setMinutesBefore,
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
