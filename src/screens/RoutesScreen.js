// RoutesScreen — overzicht van beschikbare routes voor een event.
// Een "route" is een vooraf samengestelde volgorde van voorstellingen op
// een specifieke datum.

import React, { useMemo, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { Map } from 'lucide-react-native';

import { colors, spacing, radii, fontSizes, fonts, shadows } from '../theme';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';

export default function RoutesScreen({ route, navigation }) {
    const { event } = route.params ?? {};
    const { routes, language } = useApp();
    const t = translations[language]?.common ?? {};

    useLayoutEffect(() => {
        navigation.setOptions({ title: t.routes || 'Routes' });
    }, [navigation, t.routes]);

    const eventRoutes = useMemo(
        () => routes.filter(r => !event || r.event === event),
        [routes, event]
    );

    if (eventRoutes.length === 0) {
        return (
            <View style={styles.empty}>
                <Map size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>{t.noRoutesAvailable || 'Geen routes beschikbaar'}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={eventRoutes}
            keyExtractor={r => r.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            renderItem={({ item }) => (
                <Pressable
                    style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                    onPress={() => navigation.navigate('RouteDetail', { route: item })}
                >
                    {item.image && (
                        <View style={styles.imageWrap}>
                            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                        </View>
                    )}
                    <View style={styles.body}>
                        <Text style={styles.title}>
                            {language === 'en' && item.titleEng ? item.titleEng : item.title}
                        </Text>
                        {item.code && <Text style={styles.code}>{item.code}</Text>}
                        <Text style={styles.event}>{item.event}</Text>
                        {item.dates?.length > 0 && (
                            <Text style={styles.dates}>{item.dates.join(' · ')}</Text>
                        )}
                    </View>
                </Pressable>
            )}
        />
    );
}

const styles = StyleSheet.create({
    list: { padding: spacing.md },
    empty: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        padding: spacing.xl, gap: spacing.md,
    },
    emptyText: {
        color: colors.textOnDark, opacity: 0.8,
        fontFamily: fonts.regular, fontSize: fontSizes.base,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: radii.lg,
        overflow: 'hidden',
        ...shadows.card,
    },
    imageWrap: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#f3f4f6',
    },
    image: { width: '100%', height: '100%' },
    body: { padding: spacing.md },
    title: {
        fontSize: fontSizes.lg,
        fontFamily: fonts.bold,
        color: colors.secondary,
        marginBottom: spacing.xs,
    },
    code: {
        fontSize: fontSizes.sm,
        fontFamily: fonts.semibold,
        color: colors.primaryHover,
        marginBottom: spacing.xs,
    },
    event: {
        fontSize: fontSizes.sm,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
    },
    dates: {
        fontSize: fontSizes.sm,
        fontFamily: fonts.regular,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});
