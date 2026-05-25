// AsyncStorage wrapper — vervangt localStorage uit de webversie.
// AsyncStorage werkt async (Promises), dus alle calls zijn awaitable.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    TIMETABLE_CACHE: 'ctfTimetableCache',
    FAVORITES: 'ctfFavorites',
    LANGUAGE: 'ctfLanguage',
    SCHEDULED_NOTIFICATIONS: 'ctfScheduledNotifications',
};

export const storageKeys = KEYS;

export async function getItem(key) {
    try {
        return await AsyncStorage.getItem(key);
    } catch (err) {
        console.warn(`storage.getItem(${key}) failed:`, err);
        return null;
    }
}

export async function setItem(key, value) {
    try {
        await AsyncStorage.setItem(key, value);
        return true;
    } catch (err) {
        console.warn(`storage.setItem(${key}) failed:`, err);
        return false;
    }
}

export async function removeItem(key) {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    } catch (err) {
        console.warn(`storage.removeItem(${key}) failed:`, err);
        return false;
    }
}

export async function getJSON(key) {
    const raw = await getItem(key);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (err) {
        console.warn(`storage.getJSON(${key}) parse failed:`, err);
        return null;
    }
}

export async function setJSON(key, value) {
    try {
        return await setItem(key, JSON.stringify(value));
    } catch (err) {
        console.warn(`storage.setJSON(${key}) stringify failed:`, err);
        return false;
    }
}
