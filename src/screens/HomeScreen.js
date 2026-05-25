// HomeScreen — toont de daadwerkelijke events uit de backend.
// Met taalwissel-knop, favorieten-link en offline indicator.

import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Heart, Globe, RefreshCw, Map, Settings } from 'lucide-react-native';

import { colors, spacing, radii, fontSizes, fonts } from '../theme';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';

export default function HomeScreen({ navigation }) {
    const {
        uniqueEvents, eventInfoMap, routes, language, loading, isOffline, error,
        favorites, refresh, changeLanguage,
    } = useApp();

    const t = translations[language]?.common ?? {};

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable hitSlop={8} onPress={() => navigation.navigate('Settings')} style={{ padding: 8 }}>
                    <Settings size={20} color={colors.textOnDark} />
                </Pressable>
            ),
        });
    }, [navigation]);

    if (loading && uniqueEvents.length === 0) {
        return (
            <View style={styles.centerScreen}>
                <ActivityIndicator size="large" color={colors.textOnDark} />
                <Text style={styles.loadingText}>{t.loading || 'Laden...'}</Text>
            </View>
        );
    }

    if (error && uniqueEvents.length === 0) {
        return (
            <View style={styles.centerScreen}>
                <Text style={styles.errorText}>
                    {error === 'timeout' ? (t.errorTimeout || 'Verbinding verlopen') : (t.errorLoading || 'Kon data niet laden')}
                </Text>
                <Pressable style={styles.retryButton} onPress={refresh}>
                    <RefreshCw size={18} color={colors.textOnDark} />
                    <Text style={styles.retryText}>{t.retry || 'Opnieuw proberen'}</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.textOnDark} />
            }
        >
            <View style={styles.topBar}>
                <Pressable
                    onPress={() => changeLanguage(language === 'nl' ? 'en' : 'nl')}
                    style={styles.iconButton}
                >
                    <Globe size={18} color={colors.textOnDark} />
                    <Text style={styles.iconButtonText}>{language === 'nl' ? 'EN' : 'NL'}</Text>
                </Pressable>
            </View>

            <Text style={styles.heading}>{t.chooseCity || 'Kies een stad'}</Text>

            {isOffline && (
                <View style={styles.offlineBanner}>
                    <Text style={styles.offlineText}>{t.offlineMode || 'Offline modus — data uit cache'}</Text>
                </View>
            )}

            <View style={styles.buttonGrid}>
                {uniqueEvents.map(event => {
                    const dateLabel = eventInfoMap[event]?.dateString;
                    return (
                        <Pressable
                            key={event}
                            style={({ pressed }) => [styles.eventButton, pressed && styles.buttonPressed]}
                            onPress={() => navigation.navigate('Timetable', { event })}
                        >
                            <Text style={styles.eventButtonText}>{event}</Text>
                            {dateLabel && <Text style={styles.eventDate}>{dateLabel}</Text>}
                        </Pressable>
                    );
                })}

                <Pressable
                    style={({ pressed }) => [styles.favButton, pressed && styles.buttonPressed]}
                    onPress={() => navigation.navigate('Favorites')}
                >
                    <Heart size={20} color={colors.textOnDark} />
                    <Text style={styles.favButtonText}>
                        {t.favorites || 'Favorieten'} {favorites.size > 0 && `(${favorites.size})`}
                    </Text>
                </Pressable>

                {routes?.length > 0 && (
                    <Pressable
                        style={({ pressed }) => [styles.favButton, pressed && styles.buttonPressed]}
                        onPress={() => navigation.navigate('Routes')}
                    >
                        <Map size={20} color={colors.textOnDark} />
                        <Text style={styles.favButtonText}>{t.routes || 'Routes'}</Text>
                    </Pressable>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: spacing.lg,
    },
    centerScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: spacing.md,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.glassLight,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radii.full,
    },
    iconButtonText: {
        color: colors.textOnDark,
        fontFamily: fonts.semibold,
        fontSize: fontSizes.sm,
    },
    heading: {
        fontSize: fontSizes.xxl,
        fontFamily: fonts.bold,
        color: colors.textOnDark,
        marginBottom: spacing.xl,
        textAlign: 'center',
    },
    offlineBanner: {
        backgroundColor: colors.warning,
        padding: spacing.sm,
        borderRadius: radii.md,
        marginBottom: spacing.md,
    },
    offlineText: {
        color: colors.textOnDark,
        textAlign: 'center',
        fontFamily: fonts.semibold,
    },
    buttonGrid: {
        gap: spacing.md,
    },
    eventButton: {
        backgroundColor: colors.accent,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.md,
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.7,
    },
    eventButtonText: {
        fontSize: fontSizes.xl,
        fontFamily: fonts.bold,
        color: colors.textPrimary,
    },
    eventDate: {
        fontSize: fontSizes.sm,
        fontFamily: fonts.regular,
        color: colors.textPrimary,
        marginTop: spacing.xs,
        opacity: 0.7,
    },
    favButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.secondary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.md,
        marginTop: spacing.md,
    },
    favButtonText: {
        fontSize: fontSizes.lg,
        fontFamily: fonts.semibold,
        color: colors.textOnDark,
    },
    loadingText: {
        color: colors.textOnDark,
        marginTop: spacing.md,
        fontFamily: fonts.regular,
        fontSize: fontSizes.base,
    },
    errorText: {
        color: colors.textOnDark,
        fontFamily: fonts.semibold,
        fontSize: fontSizes.lg,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.secondary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.md,
    },
    retryText: {
        color: colors.textOnDark,
        fontFamily: fonts.semibold,
    },
});
