// SafetyIcons — rij met pictogrammen voor toegankelijkheid/taal/etc.
// Iconen worden van een R2 CDN URL geladen, geconfigureerd in safetyIcons.js.

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

import { SAFETY_ICONS } from '../safetyIcons';
import { spacing } from '../theme';

export default function SafetyIcons({ safetyInfo }) {
    if (!safetyInfo) return null;
    const active = SAFETY_ICONS.filter(icon => safetyInfo[icon.key]);
    if (active.length === 0) return null;

    return (
        <View style={styles.row}>
            {active.map(icon => (
                <Image
                    key={icon.key}
                    source={{ uri: icon.url }}
                    style={styles.icon}
                    resizeMode="contain"
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        width: 24,
        height: 24,
    },
});
