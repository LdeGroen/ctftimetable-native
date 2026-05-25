// PerformanceDetailScreen — uitgebreide info over één voorstelling.
// In de webversie was dit een popup; hier is het een volledig scherm.

import React, { useMemo, useState, useLayoutEffect, useEffect } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { ChevronDown, ChevronUp, Heart, Volume2, VolumeX } from 'lucide-react-native';

import { speak, stop as stopTts } from '../tts';

import { colors, spacing, radii, fontSizes, fonts, shadows } from '../theme';
import { useApp } from '../context/AppContext';
import { parseDateForSorting } from '../utils';
import { translations } from '../translations';
import { SAFETY_ICONS } from '../safetyIcons';
import RecommendationCard from '../components/RecommendationCard';

export default function PerformanceDetailScreen({ route, navigation }) {
    const { item } = route.params ?? {};
    const { timetableData, favorites, toggleFavorite, language } = useApp();
    const t = translations[language]?.common ?? {};

    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    // Stop TTS bij unmount
    useEffect(() => {
        return () => { stopTts(); };
    }, []);

    const handleSpeak = (text) => {
        if (speaking) {
            stopTts();
            setSpeaking(false);
        } else {
            setSpeaking(true);
            speak(text, language, { onDone: () => setSpeaking(false) });
        }
    };

    const title = item?.artist ? `${item.title} — ${item.artist}` : item?.title;
    const credits = item?.marketingCredits;
    const aboutPerformance = language === 'nl' ? item?.marketingVoorstellingNL : item?.marketingVoorstellingENG;
    const aboutMakers = language === 'nl' ? item?.marketingBioNL : item?.marketingBioENG;
    const image = item?.marketingAfbeelding2;
    const isFavorite = favorites.has(item?.originalPerformanceId);

    // Hartje in header
    useLayoutEffect(() => {
        navigation.setOptions({
            title: item?.title || 'Voorstelling',
            headerRight: () => (
                <Pressable hitSlop={8} onPress={() => toggleFavorite(item.originalPerformanceId)}>
                    <Heart
                        size={24}
                        color={isFavorite ? colors.danger : colors.textOnDark}
                        fill={isFavorite ? colors.danger : 'transparent'}
                    />
                </Pressable>
            ),
        });
    }, [navigation, item, isFavorite, toggleFavorite]);

    const translatedGenre = useMemo(() => {
        if (!item?.genre || item.genre === 'N/A') return null;
        const parts = item.genre.split(',').map(g => g.trim());
        return parts.map(g => translations[language]?.genres?.[g] || g).join(' / ');
    }, [item?.genre, language]);

    // Alle uitvoeringen van dezelfde voorstelling
    const occurrences = useMemo(() => {
        if (!item) return [];
        return timetableData
            .filter(p => p.artist === item.artist && p.title === item.title)
            .sort((a, b) => {
                const dA = parseDateForSorting(a.date) || 0;
                const dB = parseDateForSorting(b.date) || 0;
                if (dA !== dB) return dA - dB;
                return (a.time || '').localeCompare(b.time || '');
            });
    }, [timetableData, item]);

    // Soortgelijk / verschillend / dichtbij
    const findPerf = (id, eventName) =>
        timetableData.find(p => p.originalPerformanceId === id && p.event === eventName);

    const recommendation = (rawList) => {
        if (!rawList || !item?.eventId) return null;
        const match = rawList.find(str => String(str).includes(item.eventId));
        if (!match) return null;
        let targetId;
        if (match.includes('|')) targetId = match.split('|')[1];
        else if (match.includes(':')) targetId = match.split(':')[1];
        else targetId = match;
        return findPerf(targetId?.trim(), item.event);
    };

    const similarItem = useMemo(() => recommendation(item?.similarRaw), [item]);
    const differentItem = useMemo(() => recommendation(item?.differentRaw), [item]);
    const nearbyItem = useMemo(() => {
        if (!item?.nearbyLocationId) return null;
        return timetableData.find(p =>
            p.locationId === item.nearbyLocationId &&
            p.event === item.event &&
            p.originalPerformanceId !== item.originalPerformanceId
        );
    }, [item, timetableData]);

    if (!item) {
        return (
            <View style={styles.centerScreen}>
                <Text style={styles.bodyText}>{t.noDataFound || 'Voorstelling niet gevonden'}</Text>
            </View>
        );
    }

    const safetyIconsToShow = SAFETY_ICONS.filter(icon =>
        !['dutchLanguage', 'englishLanguage', 'dialogueFree', 'suitableForChildren', 'diningFacility', 'wheelchairAccessible'].includes(icon.key) &&
        item.safetyInfo?.[icon.key]
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{title}</Text>

            {/* Schedule accordion */}
            <View style={styles.section}>
                <Pressable
                    style={styles.scheduleHeader}
                    onPress={() => setScheduleOpen(!scheduleOpen)}
                >
                    <Text style={styles.sectionTitle}>{t.performanceSchedule || 'Speeldata'}</Text>
                    {scheduleOpen ? <ChevronUp size={20} color={colors.textOnDark} /> : <ChevronDown size={20} color={colors.textOnDark} />}
                </Pressable>
                {scheduleOpen && (
                    <View style={styles.scheduleList}>
                        {occurrences.map(occ => (
                            <View key={occ.id} style={styles.scheduleRow}>
                                <Text style={styles.scheduleLeft}>{occ.event} · {occ.location}</Text>
                                <Text style={styles.scheduleRight}>{occ.date} {occ.time && `· ${occ.time}`}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Image */}
            {image && (
                <View style={styles.imageWrap}>
                    <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                </View>
            )}

            {/* Tekst-secties */}
            {aboutMakers && (
                <View style={styles.textBlock}>
                    <Text style={styles.blockHeading}>{t.aboutTheMakers || 'Over de makers'}</Text>
                    <Text style={styles.blockBody}>{aboutMakers}</Text>
                </View>
            )}

            {aboutPerformance && (
                <View style={styles.textBlock}>
                    <View style={styles.blockHeadingRow}>
                        <Text style={[styles.blockHeading, { flex: 1, borderBottomWidth: 0, paddingBottom: 0 }]}>
                            {t.aboutThePerformance || 'Over de voorstelling'}
                        </Text>
                        <Pressable
                            onPress={() => handleSpeak(`${title}. ${aboutPerformance}`)}
                            hitSlop={8}
                            style={styles.ttsButton}
                        >
                            {speaking ? (
                                <VolumeX size={20} color={colors.textOnDark} />
                            ) : (
                                <Volume2 size={20} color={colors.textOnDark} />
                            )}
                        </Pressable>
                    </View>
                    <View style={styles.headingUnderline} />
                    <Text style={styles.blockBody}>{aboutPerformance}</Text>
                </View>
            )}

            {/* Genre + safety icons */}
            {(translatedGenre || safetyIconsToShow.length > 0) && (
                <View style={styles.metaBox}>
                    {translatedGenre && (
                        <Text style={styles.metaGenre}>
                            <Text style={styles.metaLabel}>{t.genre || 'Genre'}: </Text>{translatedGenre}
                        </Text>
                    )}
                    {safetyIconsToShow.length > 0 && (
                        <View style={styles.metaIcons}>
                            {safetyIconsToShow.map(icon => (
                                <Image
                                    key={icon.key}
                                    source={{ uri: icon.url }}
                                    style={styles.metaIcon}
                                    resizeMode="contain"
                                />
                            ))}
                        </View>
                    )}
                </View>
            )}

            {credits && (
                <Text style={styles.credits}>{credits}</Text>
            )}

            {/* Aanbevelingen */}
            {(similarItem || differentItem || nearbyItem) && (
                <View style={styles.recommendations}>
                    <Text style={styles.recommendationsHeading}>
                        {t.seeSomethingElse || 'Misschien ook leuk'}
                    </Text>
                    <View style={styles.recommendationsRow}>
                        {similarItem && (
                            <RecommendationCard
                                item={similarItem}
                                subtitle={t.similarShow || 'Soortgelijk'}
                                onPress={() => navigation.push('PerformanceDetail', { item: similarItem })}
                                language={language}
                            />
                        )}
                        {differentItem && (
                            <RecommendationCard
                                item={differentItem}
                                subtitle={t.differentShow || 'Iets anders'}
                                onPress={() => navigation.push('PerformanceDetail', { item: differentItem })}
                                language={language}
                            />
                        )}
                        {nearbyItem && (
                            <RecommendationCard
                                item={nearbyItem}
                                subtitle={t.nearbyShow || 'In de buurt'}
                                onPress={() => navigation.push('PerformanceDetail', { item: nearbyItem })}
                                language={language}
                            />
                        )}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    centerScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    title: {
        color: colors.textOnDark,
        fontSize: fontSizes.xxl,
        fontFamily: fonts.bold,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    section: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: radii.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        color: colors.textOnDark,
        fontSize: fontSizes.lg,
        fontFamily: fonts.semibold,
    },
    scheduleList: {
        marginTop: spacing.sm,
        gap: spacing.xs,
    },
    scheduleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    scheduleLeft: {
        color: colors.textOnDark,
        fontFamily: fonts.regular,
        flexShrink: 1,
    },
    scheduleRight: {
        color: colors.textOnDark,
        fontFamily: fonts.semibold,
    },
    imageWrap: {
        aspectRatio: 16 / 9,
        borderRadius: radii.md,
        overflow: 'hidden',
        marginBottom: spacing.md,
        ...shadows.card,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textBlock: {
        marginBottom: spacing.md,
    },
    blockHeading: {
        color: colors.textOnDark,
        fontSize: fontSizes.lg,
        fontFamily: fonts.semibold,
        marginBottom: spacing.xs,
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(255,255,255,0.3)',
        paddingBottom: spacing.xs,
    },
    blockHeadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    headingUnderline: {
        borderBottomWidth: 2,
        borderBottomColor: 'rgba(255,255,255,0.3)',
        marginBottom: spacing.xs,
    },
    ttsButton: {
        padding: spacing.xs,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: radii.full,
    },
    blockBody: {
        color: colors.textOnDark,
        fontFamily: fonts.regular,
        fontSize: fontSizes.base,
        lineHeight: 22,
    },
    metaBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: radii.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    metaGenre: {
        color: colors.textOnDark,
        fontFamily: fonts.regular,
        fontSize: fontSizes.base,
    },
    metaLabel: {
        fontFamily: fonts.bold,
    },
    metaIcons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    metaIcon: {
        width: 28,
        height: 28,
    },
    credits: {
        color: colors.textOnDark,
        opacity: 0.7,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.md,
        fontFamily: fonts.regular,
        fontSize: fontSizes.sm,
    },
    recommendations: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    recommendationsHeading: {
        color: colors.textOnDark,
        fontSize: fontSizes.xl,
        fontFamily: fonts.bold,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    recommendationsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.md,
    },
    bodyText: {
        color: colors.textOnDark,
        fontFamily: fonts.regular,
    },
});
