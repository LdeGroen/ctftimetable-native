// BlockTimetableScreen — grid-weergave: locaties (rijen) × tijdslots (kolommen).
// Genest scroll-patroon: outer ScrollView verticaal, inner horizontaal voor de tijd.

import React, { useMemo, useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { List } from 'lucide-react-native';

import { colors, spacing, radii, fontSizes, fonts } from '../theme';
import { useApp } from '../context/AppContext';
import { parseDateForSorting } from '../utils';
import { translations } from '../translations';

const LOCATION_COL_WIDTH = 110;
const TIME_COL_WIDTH = 120;
const ROW_HEIGHT = 64;

export default function BlockTimetableScreen({ route, navigation }) {
    const { event } = route.params ?? {};
    const { timetableData, favorites, toggleFavorite, language } = useApp();
    const t = translations[language]?.common ?? {};

    const [selectedDay, setSelectedDay] = useState(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    hitSlop={8}
                    onPress={() => navigation.replace('Timetable', { event })}
                    style={{ padding: spacing.sm }}
                >
                    <List size={20} color={colors.textOnDark} />
                </Pressable>
            ),
        });
    }, [navigation, event]);

    const eventPerformances = useMemo(
        () => timetableData.filter(p => p.event === event),
        [timetableData, event]
    );

    const availableDays = useMemo(() =>
        [...new Set(eventPerformances.map(p => p.date).filter(Boolean))]
            .filter(d => d !== 'Algemeen' && d !== 'N/A')
            .sort((a, b) => parseDateForSorting(a) - parseDateForSorting(b)),
        [eventPerformances]
    );

    useEffect(() => {
        if (!availableDays.includes(selectedDay)) {
            setSelectedDay(availableDays[0] || null);
        }
    }, [availableDays, selectedDay]);

    const { locations, timeSlots, grid } = useMemo(() => {
        if (!selectedDay) return { locations: [], timeSlots: [], grid: {} };
        const dayItems = eventPerformances.filter(p => p.date === selectedDay && p.time);
        if (dayItems.length === 0) return { locations: [], timeSlots: [], grid: {} };

        const locs = [...new Set(dayItems.map(p => p.location).filter(Boolean))].sort();

        let minTime = 23.5, maxTime = 0;
        dayItems.forEach(p => {
            const [h, m] = p.time.split(':').map(Number);
            const v = h + m / 60;
            if (v < minTime) minTime = v;
            if (v > maxTime) maxTime = v;
        });

        const startH = Math.floor(minTime);
        const endH = Math.ceil(maxTime) + 1;
        const slots = [];
        for (let h = startH; h < endH; h++) {
            slots.push(`${String(h).padStart(2, '0')}:00`);
            slots.push(`${String(h).padStart(2, '0')}:30`);
        }

        const g = {};
        locs.forEach(loc => { g[loc] = {}; slots.forEach(s => { g[loc][s] = null; }); });
        dayItems.forEach(p => {
            const [h, m] = p.time.split(':').map(Number);
            const slot = `${String(h).padStart(2, '0')}:${m < 30 ? '00' : '30'}`;
            if (g[p.location] && g[p.location][slot] === null) {
                g[p.location][slot] = p;
            }
        });

        return { locations: locs, timeSlots: slots, grid: g };
    }, [selectedDay, eventPerformances]);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dayRow}
            >
                {availableDays.length === 0 && (
                    <Text style={styles.empty}>{t.noDataFound?.replace('%s', event) || 'Geen data'}</Text>
                )}
                {availableDays.map(day => {
                    const isTryOut = eventPerformances
                        .filter(p => p.date === day)
                        .every(p => p.isTryOut);
                    const label = isTryOut ? `${day} (try-outs)` : day;
                    return (
                        <Pressable
                            key={day}
                            onPress={() => setSelectedDay(day)}
                            style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
                        >
                            <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextActive]}>
                                {label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            {selectedDay && (
                <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContent}>
                    <ScrollView horizontal showsHorizontalScrollIndicator>
                        <View>
                            {/* Header row: tijden */}
                            <View style={styles.row}>
                                <View style={[styles.cornerCell, { width: LOCATION_COL_WIDTH }]} />
                                {timeSlots.map(time => (
                                    <View key={time} style={[styles.headerCell, { width: TIME_COL_WIDTH }]}>
                                        <Text style={styles.headerText}>{time}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Body rows: locatie + cellen */}
                            {locations.map(loc => (
                                <View key={loc} style={styles.row}>
                                    <View style={[styles.locationCell, { width: LOCATION_COL_WIDTH }]}>
                                        <Text style={styles.locationText} numberOfLines={2}>{loc}</Text>
                                    </View>
                                    {timeSlots.map(time => {
                                        const perf = grid[loc]?.[time];
                                        return (
                                            <View key={`${loc}-${time}`} style={[styles.cellWrap, { width: TIME_COL_WIDTH }]}>
                                                <BlockCell
                                                    perf={perf}
                                                    isFavorite={perf ? favorites.has(perf.originalPerformanceId) : false}
                                                    onPress={() => perf && navigation.navigate('PerformanceDetail', { item: perf })}
                                                    onToggleFavorite={() => perf && toggleFavorite(perf.originalPerformanceId)}
                                                    language={language}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </ScrollView>
            )}
        </View>
    );
}

function BlockCell({ perf, isFavorite, onPress, onToggleFavorite, language }) {
    const t = translations[language]?.common ?? {};
    if (!perf) return null;

    const lower = perf.crowdLevel?.toLowerCase();
    const isCancelled = lower === 'geannuleerd' || lower === 'cancelled';
    const isFull = lower === 'vol' || lower === 'full';
    const fullTitle = perf.artist ? `${perf.artist} — ${perf.title}` : perf.title;

    let bg = colors.primary;
    if (isCancelled) bg = '#6b7280';
    else if (isFull) bg = colors.danger;

    return (
        <Pressable
            onPress={() => !isCancelled && onPress()}
            style={[styles.cell, { backgroundColor: bg }, isCancelled && { opacity: 0.7 }]}
        >
            <Text style={[styles.cellText, isCancelled && { textDecorationLine: 'line-through' }]} numberOfLines={3}>
                {fullTitle}
            </Text>
            {isFull && <Text style={styles.cellBadge}>{t.vol || 'VOL'}</Text>}
            {isCancelled && <Text style={styles.cellBadge}>{t.geannuleerd || 'GEANNULEERD'}</Text>}
            {!isCancelled && (
                <Pressable
                    style={styles.heartCorner}
                    onPress={onToggleFavorite}
                    hitSlop={4}
                >
                    <View style={[styles.heartDot, isFavorite && { backgroundColor: colors.danger }]} />
                </Pressable>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    dayRow: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    dayChip: {
        backgroundColor: colors.glassLight,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radii.md,
    },
    dayChipActive: {
        backgroundColor: colors.primaryHover,
    },
    dayChipText: {
        color: colors.textOnDark,
        fontFamily: fonts.semibold,
        fontSize: fontSizes.sm,
    },
    dayChipTextActive: {
        color: colors.textOnDark,
    },
    empty: {
        color: colors.textOnDark,
        padding: spacing.md,
    },
    gridScroll: { flex: 1 },
    gridContent: { padding: spacing.sm },
    row: {
        flexDirection: 'row',
    },
    cornerCell: {
        height: 36,
        backgroundColor: colors.secondary,
    },
    headerCell: {
        height: 36,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,255,255,0.2)',
    },
    headerText: {
        color: colors.textOnDark,
        fontFamily: fonts.bold,
        fontSize: fontSizes.sm,
    },
    locationCell: {
        height: ROW_HEIGHT,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    locationText: {
        color: colors.textOnDark,
        fontFamily: fonts.semibold,
        fontSize: fontSizes.xs,
        textAlign: 'right',
    },
    cellWrap: {
        height: ROW_HEIGHT,
        padding: 2,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cell: {
        flex: 1,
        borderRadius: radii.sm,
        padding: spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    cellText: {
        color: colors.textOnDark,
        fontSize: 10,
        fontFamily: fonts.semibold,
        textAlign: 'center',
    },
    cellBadge: {
        color: colors.textOnDark,
        fontSize: 9,
        fontFamily: fonts.bold,
        marginTop: 2,
        letterSpacing: 0.5,
    },
    heartCorner: {
        position: 'absolute',
        top: 2,
        right: 2,
        padding: 2,
    },
    heartDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
});
