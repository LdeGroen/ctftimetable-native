// HomeScreen — startscherm met stad-keuze.
// TODO Fase 2: events ophalen via api.js, dynamische knoppen renderen.

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { colors, spacing, radii, fontSizes, fonts } from '../theme';

const PLACEHOLDER_EVENTS = ['Utrecht', 'Den Haag', 'Rotterdam', 'Amsterdam'];

export default function HomeScreen({ navigation }) {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Kies een stad</Text>
            <View style={styles.buttonGrid}>
                {PLACEHOLDER_EVENTS.map(event => (
                    <Pressable
                        key={event}
                        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                        onPress={() => navigation.navigate('Timetable', { event })}
                    >
                        <Text style={styles.buttonText}>{event}</Text>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: spacing.lg,
        alignItems: 'center',
    },
    heading: {
        fontSize: fontSizes.xxl,
        fontFamily: fonts.bold,
        color: colors.textOnDark,
        marginBottom: spacing.xl,
    },
    buttonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.md,
    },
    button: {
        backgroundColor: colors.accent,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: radii.md,
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: fontSizes.lg,
        fontFamily: fonts.semibold,
        color: colors.textPrimary,
    },
});
