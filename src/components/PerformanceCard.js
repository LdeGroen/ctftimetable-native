// PerformanceCard — visuele kaart voor één voorstelling.
// Native tegenhanger van components/PerformanceCard.jsx uit de webversie.

import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Linking, Alert } from 'react-native';
import { Heart, Calendar, Share2, MapPin } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

import { colors, spacing, radii, fontSizes, fonts, shadows } from '../theme';
import CrowdMeter from './CrowdMeter';
import SafetyIcons from './SafetyIcons';
import { translations } from '../translations';

function PerformanceCard({
    item,
    isFavorite,
    onToggleFavorite,
    onPress,
    language = 'nl',
    hideTime = false,
    isFriendsView = false,
}) {
    const t = translations[language]?.common ?? {};

    const fullTitle = item.artist ? `${item.artist} — ${item.title}` : item.title;
    const isCancelled = ['geannuleerd', 'cancelled'].includes(item.crowdLevel?.toLowerCase());
    const isFull = ['vol', 'full'].includes(item.crowdLevel?.toLowerCase());
    const disabled = isCancelled || isFull;

    const translatedGenre = useMemo(() => {
        if (!item.genre || item.genre === 'N/A') return null;
        const parts = item.genre.split(',').map(g => g.trim());
        return parts.map(g => translations[language]?.genres?.[g] || g).join(' / ');
    }, [item.genre, language]);

    const cardImage = item.marketingAfbeelding2 || item.artistImageUrl;

    const handleShare = useCallback(async (e) => {
        e?.stopPropagation?.();
        const url = `https://timetable.cafetheaterfestival.nl/?performance=${item.id}#${encodeURIComponent(item.event)}`;
        const text = (t.shareBody || '%s').replace('%s', fullTitle);
        const message = `${text}\n${url}`;
        try {
            if (await Sharing.isAvailableAsync()) {
                // expo-sharing deelt files; gebruik Share API uit react-native voor tekst
                const { Share } = require('react-native');
                await Share.share({ message, title: fullTitle });
            } else {
                await Clipboard.setStringAsync(url);
                Alert.alert(t.shareSuccess || 'Link gekopieerd');
            }
        } catch (err) {
            console.warn('share failed', err);
        }
    }, [item.id, item.event, fullTitle, t]);

    const handleCalendar = useCallback((e) => {
        e?.stopPropagation?.();
        const [day, month, year] = (item.date || '').split('-');
        if (!day || !month || !year || !item.time) return;
        const [hh, mm] = item.time.split(':');
        const start = `${year}${month}${day}T${hh}${mm}00`;
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: fullTitle,
            dates: `${start}/${start}`,
            location: item.location || '',
        });
        Linking.openURL(`https://calendar.google.com/calendar/render?${params}`);
    }, [item.date, item.time, item.location, fullTitle]);

    const handleMapPress = useCallback((e) => {
        e?.stopPropagation?.();
        if (item.googleMapsUrl) Linking.openURL(item.googleMapsUrl);
    }, [item.googleMapsUrl]);

    return (
        <Pressable
            onPress={() => !disabled && onPress?.(item)}
            style={({ pressed }) => [
                styles.card,
                disabled && styles.disabled,
                pressed && !disabled && styles.pressed,
            ]}
        >
            {translatedGenre && (
                <View style={styles.genreBadge}>
                    <Text style={styles.genreText}>{translatedGenre.toUpperCase()}</Text>
                </View>
            )}

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    {!hideTime && item.time && (
                        <Text style={styles.time}>{item.time}</Text>
                    )}
                    <View style={styles.actionRow}>
                        {!hideTime && !disabled && (
                            <>
                                <Pressable hitSlop={8} onPress={(e) => { e.stopPropagation(); onToggleFavorite?.(item); }}>
                                    <Heart
                                        size={22}
                                        color={isFavorite ? colors.danger : colors.textMuted}
                                        fill={isFavorite ? colors.danger : 'transparent'}
                                    />
                                </Pressable>
                                {!isFriendsView && (
                                    <>
                                        <Pressable hitSlop={8} onPress={handleCalendar}>
                                            <Calendar size={22} color={colors.textSecondary} />
                                        </Pressable>
                                        <Pressable hitSlop={8} onPress={handleShare}>
                                            <Share2 size={22} color={colors.textSecondary} />
                                        </Pressable>
                                    </>
                                )}
                            </>
                        )}
                    </View>
                </View>

                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={2}>{fullTitle}</Text>
                    <Pressable
                        onPress={handleMapPress}
                        disabled={!item.googleMapsUrl}
                        hitSlop={8}
                        style={styles.locationButton}
                    >
                        <Text style={styles.locationText}>{item.location}</Text>
                        {item.googleMapsUrl && <MapPin size={16} color={colors.secondary} />}
                    </Pressable>
                </View>

                {cardImage && (
                    <View style={styles.imageWrap}>
                        <Image
                            source={{ uri: cardImage }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>
                )}

                {!hideTime && item.crowdLevel && (
                    <CrowdMeter level={item.crowdLevel} language={language} />
                )}

                <View style={styles.footerRow}>
                    <SafetyIcons safetyInfo={item.safetyInfo} />
                    {(item.isCalmRoute || item.pwycLink) && (
                        <View style={styles.tags}>
                            {item.isCalmRoute && (
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>{t.calmRoute || 'Stille route'}</Text>
                                </View>
                            )}
                            {item.pwycLink && (
                                <Pressable
                                    style={styles.tag}
                                    onPress={(e) => { e.stopPropagation(); Linking.openURL(item.pwycLink); }}
                                >
                                    <Text style={styles.tagText}>PWYC</Text>
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: radii.lg,
        overflow: 'hidden',
        ...shadows.card,
    },
    disabled: {
        opacity: 0.5,
    },
    pressed: {
        transform: [{ scale: 0.98 }],
    },
    genreBadge: {
        backgroundColor: colors.primaryHover,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
    },
    genreText: {
        color: colors.textOnDark,
        fontFamily: fonts.bold,
        fontSize: fontSizes.xs,
        letterSpacing: 0.5,
    },
    content: {
        padding: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        minHeight: 24,
    },
    time: {
        fontSize: fontSizes.xl,
        fontFamily: fonts.bold,
        color: colors.textPrimary,
    },
    actionRow: {
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    title: {
        flex: 1,
        fontSize: fontSizes.lg,
        fontFamily: fonts.semibold,
        color: colors.secondary,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        maxWidth: '45%',
    },
    locationText: {
        fontSize: fontSizes.sm,
        fontFamily: fonts.semibold,
        color: colors.textSecondary,
        textAlign: 'right',
    },
    imageWrap: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: radii.md,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
        marginVertical: spacing.sm,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    tags: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    tag: {
        backgroundColor: colors.secondary,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: radii.sm,
    },
    tagText: {
        color: colors.textOnDark,
        fontSize: fontSizes.xs,
        fontFamily: fonts.semibold,
    },
});

// React.memo houdt cards stabiel als alleen een ándere favoriet wisselt.
export default React.memo(PerformanceCard, (prev, next) => (
    prev.item === next.item &&
    prev.isFavorite === next.isFavorite &&
    prev.language === next.language &&
    prev.hideTime === next.hideTime &&
    prev.isFriendsView === next.isFriendsView
));
