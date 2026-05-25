// AppContext — globale app-state: timetable data, favorites, language, loading.
// Vervangt de losse useState calls die in de webversie in app.js stonden.

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import * as Localization from 'expo-localization';

import { fetchAndBuildTimetable } from '../data';
import { getJSON, setJSON, getItem, setItem, storageKeys } from '../storage';

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
        refresh,
        toggleFavorite,
        changeLanguage,
    }), [
        timetableData, eventInfoMap, uniqueEvents, routes, notifications,
        favorites, language, loading, isOffline, error,
        refresh, toggleFavorite, changeLanguage,
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
