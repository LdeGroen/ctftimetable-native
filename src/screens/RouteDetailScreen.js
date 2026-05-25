// RouteDetailScreen — toont alle voorstellingen die in een gekozen route zitten,
// in de volgorde zoals door de redactie samengesteld.

import React, { useMemo, useLayoutEffect } from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';

import { colors, spacing, radii, fontSizes, fonts } from '../theme';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import PerformanceCard from '../components/PerformanceCard';

export default function RouteDetailScreen({ route: navRoute, navigation }) {
    const { route: routeItem } = navRoute.params ?? {};
    const { timetableData, favorites, toggleFavorite, language } = useApp();
    const t = translations[language]?.common ?? {};

    const title = language === 'en' && routeItem?.titleEng ? routeItem.titleEng : routeItem?.title;
    const text = language === 'en' && routeItem?.textEng ? routeItem.textEng : routeItem?.text;

    useLayoutEffect(() => {
        navigation.setOptions({ title: title || (t.routes || 'Route') });
    }, [navigation, title, t.routes]);

    // De `executionIds` van de route zijn de IDs van de uitvoeringen,
    // in de volgorde die de redactie heeft bepaald.
    const stops = useMemo(() => {
        if (!routeItem?.executionIds?.length) return [];
        const map = new Map(timetableData.map(p => [p.id, p]));
        return routeItem.executionIds
            .map(id => map.get(String(id)))
            .filter(Boolean);
    }, [routeItem, timetableData]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {routeItem?.image && (
                <View style={styles.imageWrap}>
                    <Image source={{ uri: routeItem.image }} style={styles.image} resizeMode="cover" />
                </View>
            )}

            <Text style={styles.title}>{title}</Text>
            {routeItem?.code && <Text style={styles.code}>{routeItem.code}</Text>}

            {text && <Text style={styles.text}>{text}</Text>}

            {stops.length > 0 ? (
                <View style={styles.stops}>
                    <Text style={styles.stopsHeading}>{t.routeStops || 'Voorstellingen in deze route'}</Text>
                    {stops.map((stop, idx) => (
                        <View key={stop.id} style={styles.stopRow}>
                            <View style={styles.stopNumber}>
                                <Text style={styles.stopNumberText}>{idx + 1}</Text>
                            </View>
                            <View style={styles.stopCard}>
                                <PerformanceCard
                                    item={stop}
                                    isFavorite={favorites.has(stop.originalPerformanceId)}
                                    onToggleFavorite={() => toggleFavorite(stop.originalPerformanceId)}
                                    onPress={(item) => navigation.navigate('PerformanceDetail', { item })}
                                    language={language}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={styles.empty}>{t.noPerformancesInRoute || 'Geen voorstellingen in deze route'}</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    imageWrap: {
        aspectRatio: 16 / 9,
        borderRadius: radii.md,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    image: { width: '100%', height: '100%' },
    title: {
        color: colors.textOnDark,
        fontSize: fontSizes.xxl,
        fontFamily: fonts.bold,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    code: {
        color: colors.primaryHover,
        fontSize: fontSizes.base,
        fontFamily: fonts.semibold,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    text: {
        color: colors.textOnDark,
        fontFamily: fonts.regular,
        fontSize: fontSizes.base,
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    stops: {
        gap: spacing.md,
    },
    stopsHeading: {
        color: colors.textOnDark,
        fontSize: fontSizes.lg,
        fontFamily: fonts.bold,
        marginBottom: spacing.sm,
    },
    stopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    stopNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primaryHover,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    stopNumberText: {
        color: colors.textOnDark,
        fontFamily: fonts.bold,
        fontSize: fontSizes.base,
    },
    stopCard: {
        flex: 1,
    },
    empty: {
        color: colors.textOnDark,
        opacity: 0.8,
        textAlign: 'center',
        padding: spacing.lg,
        fontFamily: fonts.regular,
    },
});
