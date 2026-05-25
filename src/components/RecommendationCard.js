// RecommendationCard — kleinere variant van PerformanceCard,
// gebruikt onderaan de detail-pagina voor "Misschien ook leuk".

import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';

import { colors, spacing, radii, fontSizes, fonts, shadows } from '../theme';
import { translations } from '../translations';

export default function RecommendationCard({ item, subtitle, onPress, language = 'nl' }) {
    if (!item) return null;
    const fullTitle = item.artist ? `${item.artist} — ${item.title}` : item.title;

    const translatedGenre = useMemo(() => {
        const genres = (item.genre && item.genre !== 'N/A')
            ? item.genre.split(',').map(g => g.trim())
            : [];
        const subgenres = Array.isArray(item.subgenre) ? item.subgenre : [];
        const all = [...genres, ...subgenres];
        if (all.length === 0) return null;
        return all.map(g => translations[language]?.genres?.[g] || g).join(' / ');
    }, [item.genre, item.subgenre, language]);

    const image = item.marketingAfbeelding2 || item.artistImageUrl;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
        >
            <View style={styles.subtitleBar}>
                <Text style={styles.subtitleText}>{subtitle.toUpperCase()}</Text>
            </View>
            {translatedGenre && (
                <View style={styles.genreBar}>
                    <Text style={styles.genreText}>{translatedGenre.toUpperCase()}</Text>
                </View>
            )}
            {image && (
                <View style={styles.imageWrap}>
                    <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                </View>
            )}
            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={2}>{fullTitle}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 200,
        backgroundColor: colors.cardBackground,
        borderRadius: radii.md,
        overflow: 'hidden',
        ...shadows.card,
    },
    subtitleBar: {
        backgroundColor: colors.secondary,
        paddingVertical: 4,
        alignItems: 'center',
    },
    subtitleText: {
        color: colors.textOnDark,
        fontFamily: fonts.bold,
        fontSize: 10,
        letterSpacing: 0.5,
    },
    genreBar: {
        backgroundColor: colors.primaryHover,
        paddingVertical: 4,
        alignItems: 'center',
    },
    genreText: {
        color: colors.textOnDark,
        fontFamily: fonts.bold,
        fontSize: 10,
        letterSpacing: 0.5,
    },
    imageWrap: {
        width: '100%',
        height: 110,
        backgroundColor: '#f3f4f6',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    body: {
        padding: spacing.sm,
        minHeight: 50,
        justifyContent: 'center',
    },
    title: {
        color: colors.secondary,
        fontFamily: fonts.bold,
        fontSize: fontSizes.sm,
        textAlign: 'center',
    },
});
