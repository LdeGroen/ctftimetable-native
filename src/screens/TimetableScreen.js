// TimetableScreen — toont voorstellingen voor een gekozen event.
// TODO Fase 2/3: data ophalen via api.js, filteren op event/datum, FlatList renderen.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, fonts } from '../theme';

export default function TimetableScreen({ route }) {
    const { event } = route.params ?? {};
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>{event}</Text>
            <Text style={styles.subtle}>Timetable komt hier — placeholder voor Fase 2.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        fontSize: fontSizes.xxxl,
        fontFamily: fonts.bold,
        color: colors.textOnDark,
        marginBottom: spacing.md,
    },
    subtle: {
        fontSize: fontSizes.base,
        fontFamily: fonts.regular,
        color: colors.textOnDark,
        opacity: 0.7,
        textAlign: 'center',
    },
});
