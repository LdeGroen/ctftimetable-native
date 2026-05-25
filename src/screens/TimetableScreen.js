// TimetableScreen — toont voorstellingen voor een gekozen event,
// gefilterd op datum + zoekterm + genre/icon filters.

import React, { useMemo, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';

import { colors, spacing, radii, fontSizes, fonts } from '../theme';
import { useApp } from '../context/AppContext';
import { parseDateForSorting } from '../utils';
import { translations } from '../translations';
import PerformanceCard from '../components/PerformanceCard';
import SearchBar from '../components/SearchBar';
import FilterSheet from '../components/FilterSheet';

const ALL_DATES = 'all';

export default function TimetableScreen({ route, navigation }) {
    const { event } = route.params ?? {};
    const { timetableData, favorites, toggleFavorite, language } = useApp();

    const [selectedDate, setSelectedDate] = useState(ALL_DATES);
    const [searchTerm, setSearchTerm] = useState('');
    const [genreFilters, setGenreFilters] = useState(new Set());
    const [iconFilters, setIconFilters] = useState(new Set());
    const [filterOpen, setFilterOpen] = useState(false);

    const t = translations[language]?.common ?? {};
    const filterCount = genreFilters.size + iconFilters.size;

    // Filterknop rechts in header
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable hitSlop={8} onPress={() => setFilterOpen(true)} style={styles.headerButton}>
                    <SlidersHorizontal size={20} color={colors.textOnDark} />
                    {filterCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{filterCount}</Text>
                        </View>
                    )}
                </Pressable>
            ),
        });
    }, [navigation, filterCount]);

    // Items voor dit event
    const itemsForEvent = useMemo(
        () => timetableData.filter(item => item.event === event),
        [timetableData, event]
    );

    // Unieke datums (chronologisch)
    const dates = useMemo(() => {
        const set = new Set(
            itemsForEvent
                .filter(i => i.date && i.date !== 'Algemeen' && i.date !== 'N/A')
                .map(i => i.date)
        );
        return Array.from(set).sort(
            (a, b) => (parseDateForSorting(a) || 0) - (parseDateForSorting(b) || 0)
        );
    }, [itemsForEvent]);

    // Beschikbare genres voor dit event
    const allGenres = useMemo(() => {
        const set = new Set();
        itemsForEvent.forEach(item => {
            if (!item.genre || item.genre === 'N/A') return;
            item.genre.split(',').map(g => g.trim()).forEach(g => set.add(g));
        });
        return Array.from(set).map(key => ({
            key,
            label: translations[language]?.genres?.[key] || key,
        }));
    }, [itemsForEvent, language]);

    // Toegepaste filters
    const filteredItems = useMemo(() => {
        let result = itemsForEvent;

        // Datum
        if (selectedDate !== ALL_DATES) {
            result = result.filter(i => i.date === selectedDate);
        }

        // Zoekterm
        const q = searchTerm.trim().toLowerCase();
        if (q) {
            result = result.filter(i =>
                (i.artist || '').toLowerCase().includes(q) ||
                (i.title || '').toLowerCase().includes(q) ||
                (i.location || '').toLowerCase().includes(q)
            );
        }

        // Genres
        if (genreFilters.size > 0) {
            result = result.filter(i => {
                if (!i.genre) return false;
                const itemGenres = i.genre.split(',').map(g => g.trim());
                return itemGenres.some(g => genreFilters.has(g));
            });
        }

        // Icon filters (alle moeten matchen)
        if (iconFilters.size > 0) {
            result = result.filter(i => {
                if (!i.safetyInfo) return false;
                return Array.from(iconFilters).every(key => i.safetyInfo[key]);
            });
        }

        // Sorteer op tijd binnen één datum
        return result.slice().sort((a, b) => {
            const dA = parseDateForSorting(a.date) || 0;
            const dB = parseDateForSorting(b.date) || 0;
            if (dA !== dB) return dA - dB;
            return (a.time || '').localeCompare(b.time || '');
        });
    }, [itemsForEvent, selectedDate, searchTerm, genreFilters, iconFilters]);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateRow}
            >
                <DateChip
                    label={t.allPerformances || 'Alle'}
                    active={selectedDate === ALL_DATES}
                    onPress={() => setSelectedDate(ALL_DATES)}
                />
                {dates.map(date => (
                    <DateChip
                        key={date}
                        label={date}
                        active={selectedDate === date}
                        onPress={() => setSelectedDate(date)}
                    />
                ))}
            </ScrollView>

            <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t.searchPlaceholder || 'Zoek artiest, titel, locatie...'}
            />

            <FlatList
                data={filteredItems}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <PerformanceCard
                        item={item}
                        isFavorite={favorites.has(item.originalPerformanceId)}
                        onToggleFavorite={() => toggleFavorite(item.originalPerformanceId)}
                        language={language}
                    />
                )}
                ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.empty}>{t.noPerformancesFound || 'Geen voorstellingen gevonden'}</Text>
                }
                initialNumToRender={6}
                windowSize={10}
            />

            <FilterSheet
                visible={filterOpen}
                onClose={() => setFilterOpen(false)}
                genreFilters={genreFilters}
                setGenreFilters={setGenreFilters}
                allGenres={allGenres}
                iconFilters={iconFilters}
                setIconFilters={setIconFilters}
                language={language}
            />
        </View>
    );
}

function DateChip({ label, active, onPress }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && { opacity: 0.7 },
            ]}
        >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    dateRow: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.sm,
        alignItems: 'center',
    },
    chip: {
        backgroundColor: colors.glassLight,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radii.md,
    },
    chipActive: {
        backgroundColor: colors.primaryHover,
    },
    chipText: {
        color: colors.textOnDark,
        fontFamily: fonts.semibold,
        fontSize: fontSizes.sm,
    },
    chipTextActive: {
        color: colors.textOnDark,
    },
    list: {
        padding: spacing.md,
    },
    empty: {
        color: colors.textOnDark,
        textAlign: 'center',
        padding: spacing.xl,
        fontFamily: fonts.regular,
        opacity: 0.8,
    },
    headerButton: {
        padding: spacing.sm,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: colors.danger,
        borderRadius: radii.full,
        minWidth: 18,
        height: 18,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: colors.textOnDark,
        fontSize: 10,
        fontFamily: fonts.bold,
    },
});
