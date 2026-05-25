// FavoritesScreen — alle favorieten van de gebruiker, chronologisch.

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Heart } from 'lucide-react-native';

import { colors, spacing, fontSizes, fonts } from '../theme';
import { useApp } from '../context/AppContext';
import { parseDateForSorting } from '../utils';
import { translations } from '../translations';
import PerformanceCard from '../components/PerformanceCard';

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
            renderItem={({ item }) => (
                <PerformanceCard
                    item={item}
                    isFavorite
                    onToggleFavorite={() => toggleFavorite(item.originalPerformanceId)}
                    language={language}
                />
            )}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            contentContainerStyle={styles.list}
            initialNumToRender={6}
            windowSize={10}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        padding: spacing.md,
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
});
