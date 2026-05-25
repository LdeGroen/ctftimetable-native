// FavoritesScreen — overzicht van alle voorstellingen die de gebruiker
// gemarkeerd heeft als favoriet.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Heart } from 'lucide-react-native';

import { colors, spacing, radii, fontSizes, fonts, shadows } from '../theme';
import { useApp } from '../context/AppContext';
import { parseDateForSorting } from '../utils';
import { translations } from '../translations';

export default function FavoritesScreen() {
    const { timetableData, favorites, toggleFavorite, language } = useApp();
    const t = translations[language]?.common ?? {};

    const items = useMemo(() => {
        return timetableData
            .filter(item => favorites.has(item.originalPerformanceId))
            .sort((a, b) => {
                const dA = parseDateForSorting(a.date) || 0;
                const dB = parseDateForSorting(b.date) || 0;
                if (dA !== dB) return dA - dB;
                return (a.time || '').localeCompare(b.time || '');
            });
    }, [timetableData, favorites]);

    if (items.length === 0) {
        return (
            <View style={styles.empty}>
                <Heart size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>
                    {t.noFavoritesYet || 'Nog geen favorieten — tik op een hartje om voorstellingen toe te voegen.'}
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={items}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.date}>{item.date} {item.time && `· ${item.time}`}</Text>
                            <Text style={styles.event}>{item.event}</Text>
                        </View>
                        <Pressable onPress={() => toggleFavorite(item.originalPerformanceId)} hitSlop={8}>
                            <Heart size={22} color={colors.danger} fill={colors.danger} />
                        </Pressable>
                    </View>
                    <Text style={styles.title}>
                        {item.artist ? `${item.artist} — ${item.title}` : item.title}
                    </Text>
                    <Text style={styles.location}>{item.location}</Text>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        padding: spacing.md,
        gap: spacing.md,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        gap: spacing.md,
    },
    emptyText: {
        color: colors.textOnDark,
        textAlign: 'center',
        fontFamily: fonts.regular,
        fontSize: fontSizes.base,
        opacity: 0.8,
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
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    date: {
        fontSize: fontSizes.sm,
        fontFamily: fonts.semibold,
        color: colors.primary,
    },
    event: {
        fontSize: fontSizes.xs,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        marginTop: 2,
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
});
