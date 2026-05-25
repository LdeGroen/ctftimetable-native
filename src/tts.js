// TTS helper — wrapper rond expo-speech.
// Spreek voorstelling-teksten uit in NL of EN.

import * as Speech from 'expo-speech';

let currentlySpeaking = false;

const LANGUAGE_CODES = {
    nl: 'nl-NL',
    en: 'en-US',
};

export function speak(text, language = 'nl', { onDone } = {}) {
    if (!text) return;
    if (currentlySpeaking) {
        Speech.stop();
    }
    currentlySpeaking = true;
    Speech.speak(text, {
        language: LANGUAGE_CODES[language] || 'en-US',
        rate: 1.0,
        onDone: () => {
            currentlySpeaking = false;
            onDone?.();
        },
        onStopped: () => {
            currentlySpeaking = false;
            onDone?.();
        },
        onError: () => {
            currentlySpeaking = false;
            onDone?.();
        },
    });
}

export function stop() {
    if (currentlySpeaking) {
        Speech.stop();
        currentlySpeaking = false;
    }
}

export function isSpeaking() {
    return currentlySpeaking;
}
