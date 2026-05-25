// CrowdMeter — toont een gradient-bar met een marker op de positie
// die overeenkomt met het verwachte drukteniveau.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, fontSizes, fonts, radii } from '../theme';
import { translations } from '../translations';

const LEVEL_POSITIONS = {
    groen: '10%',
    green: '10%',
    oranje: '50%',
    orange: '50%',
    rood: '90%',
    red: '90%',
};

export default function CrowdMeter({ level, language = 'nl' }) {
    const t = translations[language]?.common ?? {};
    const lower = level?.toLowerCase();

    const isFull = lower === 'vol' || lower === 'full';
    const isCancelled = lower === 'geannuleerd' || lower === 'cancelled';
    const fillBar = isFull || isCancelled;

    let label = null;
    if (isFull) label = language === 'nl' ? 'Vol' : 'Full';
    if (isCancelled) label = t.geannuleerd || (language === 'nl' ? 'Geannuleerd' : 'Cancelled');

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>{t.crowdLevel || 'Verwachte drukte'}</Text>
            <View style={styles.barWrap}>
                {fillBar ? (
                    <View style={[styles.bar, styles.fullBar]}>
                        <Text style={styles.fullText}>{label}</Text>
                    </View>
                ) : (
                    <>
                        <LinearGradient
                            colors={[colors.crowdGreen, colors.crowdOrange, colors.crowdRed]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.bar}
                        />
                        <View
                            style={[
                                styles.marker,
                                { left: LEVEL_POSITIONS[lower] || '10%' },
                            ]}
                        />
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.sm,
    },
    heading: {
        fontSize: fontSizes.sm,
        fontFamily: fonts.semibold,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    barWrap: {
        position: 'relative',
        justifyContent: 'center',
    },
    bar: {
        width: '100%',
        height: 12,
        borderRadius: radii.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullBar: {
        backgroundColor: colors.crowdRed,
    },
    fullText: {
        color: colors.textOnDark,
        fontSize: fontSizes.xs,
        fontFamily: fonts.bold,
        textTransform: 'uppercase',
    },
    marker: {
        position: 'absolute',
        width: 8,
        height: 16,
        backgroundColor: colors.textPrimary,
        borderRadius: 4,
        transform: [{ translateX: -4 }],
    },
});
