// TimetableScreen — toont voorstellingen voor een gekozen event.
// Per datum filterbaar; FlatList voor scrollperformance.

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { Heart } from 'lucide-react-native';

import { colors, spacing, radii, fontSizes, fonts, shadows } from '../theme';
import { useApp } from '../context/AppContext';
import { parseDateForSorting } from '../utils';
import { translations } from '../translations';

const ALL_DATES = 'all';

export default function TimetableScreen({ route }) {
    const { event } = route.params ?? {};
    const { timetableData, favorites, toggleFavorite, language } = useApp();
    const [selectedDate, setSelectedDate] = useState(ALL_DATES);

    const t = translations[language]?.common ?? {};

    // Alleen items voor dit event
    const itemsForEvent = useMemo(
        () => timetableData.filter(item => item.event === event),
        [timetableData, event]
    );

    // Unieke datums (zonder 'Algemeen', chronologisch)
    const dates = useMemo(() => {
        const set = new Set(
            itemsForEvent
                .filter(item => item.date && item.date !== 'Algemeen' && item.date !== 'N/A')
                .map(item => item.date)
        );
        return Array.from(set).sort(
            (a, b) => (parseDateForSorting(a) || 0) - (parseDateForSorting(b) || 0)
        );
    }, [itemsForEvent]);

    // Items voor de geselecteerde datum
    const filteredItems = useMemo(() => {
        if (selectedDate === ALL_DATES) return itemsForEvent;
        return itemsForEvent.filter(item => item.date === selectedDate);
    }, [itemsForEvent, selectedDate]);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateRow}
            >
                <DateButton
                    label={t.allPerformances || 'Alle'}
                    active={selectedDate === ALL_DATES}
                    onPress={() => setSelectedDate(ALL_DATES)}
                />
                {dates.map(date => (
                    <DateButton
                        key={date}
                        label={date}
                        active={selectedDate === date}
                        onPress={() => setSelectedDate(date)}
                    />
                ))}
            </ScrollView>

            <FlatList
                data={filteredItems}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <PerformanceRow
                        item={item}
                        isFavorite={favorites.has(item.originalPerformanceId)}
                        onToggleFavorite={() => toggleFavorite(item.originalPerformanceId)}
                    />
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.empty}>{t.noPerformancesFound || 'Geen voorstellingen gevonden'}</Text>
                }
            />
        </View>
    );
}

function DateButton({ label, active, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.dateButton,
                active && styles.dateButtonActive,
                pressed && { opacity: 0.7 },
            ]}
        >
            <Text style={[styles.dateButtonText, active && styles.dateButtonTextActive]}>
                {label}
            </Text>
        </Pressable>
    );
}

function PerformanceRow({ item, isFavorite, onToggleFavorite }) {
    const fullTitle = item.artist ? `${item.artist} — ${item.title}` : item.title;
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                {item.time && <Text style={styles.time}>{item.time}</Text>}
                <Pressable onPress={onToggleFavorite} hitSlop={8} style={styles.heartButton}>
                    <Heart
                        size={22}
                        color={isFavorite ? colors.danger : colors.textMuted}
                        fill={isFavorite ? colors.danger : 'transparent'}
                    />
                </Pressable>
            </View>
            <Text style={styles.title}>{fullTitle}</Text>
            <Text style={styles.location}>{item.location}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dateRow: {
        padding: spacing.sm,
        gap: spacing.sm,
        alignItems: 'center',
    },
    dateButton: {
        backgroundColor: colors.glassLight,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radii.md,
    },
    dateButtonActive: {
        backgroundColor: colors.primary,
    },
    dateButtonText: {
        color: colors.textOnDark,
        fontFamily: fonts.semibold,
        fontSize: fontSizes.sm,
    },
    dateButtonTextActive: {
        color: colors.textOnDark,
    },
    list: {
        padding: spacing.md,
        gap: spacing.md,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: radii.lg,
        padding: spacing.md,
        ...shadows.card,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    heartButton: {
        padding: spacing.xs,
    },
    time: {
        fontSize: fontSizes.lg,
        fontFamily: fonts.bold,
        color: colors.textPrimary,
    },
    title: {
        fontSize: fontSizes.base,
        fontFamily: fonts.semibold,
        color: colors.secondary,
        marginBottom: spacing.xs,
    },
    location: {
        fontSize: fontSizes.sm,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
    empty: {
        color: colors.textOnDark,
        textAlign: 'center',
        padding: spacing.xl,
        fontFamily: fonts.regular,
    },
});
