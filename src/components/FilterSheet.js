// FilterSheet — modale bottom sheet voor genre + safety/icon filters.
// In de webversie waren dit twee aparte dropdowns; hier samen in één modal.

import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { X, SlidersHorizontal } from 'lucide-react-native';

import { colors, spacing, radii, fontSizes, fonts } from '../theme';
import { SAFETY_ICONS } from '../safetyIcons';
import { translations } from '../translations';

export default function FilterSheet({
    visible, onClose,
    genreFilters, setGenreFilters, allGenres,
    iconFilters, setIconFilters,
    language,
}) {
    const t = translations[language]?.common ?? {};

    const toggle = (set, setter, key) => {
        const next = new Set(set);
        if (next.has(key)) next.delete(key); else next.add(key);
        setter(next);
    };

    const clearAll = () => {
        setGenreFilters(new Set());
        setIconFilters(new Set());
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose} />
            <View style={styles.sheet}>
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <SlidersHorizontal size={20} color={colors.textOnDark} />
                        <Text style={styles.title}>{t.filterByIcon || 'Filters'}</Text>
                    </View>
                    <Pressable hitSlop={8} onPress={onClose}>
                        <X size={24} color={colors.textOnDark} />
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.body}>
                    {allGenres?.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>{t.filterByGenre || 'Genre'}</Text>
                            <View style={styles.chipGroup}>
                                {allGenres.map(g => {
                                    const active = genreFilters.has(g.key);
                                    return (
                                        <Pressable
                                            key={g.key}
                                            onPress={() => toggle(genreFilters, setGenreFilters, g.key)}
                                            style={[styles.chip, active && styles.chipActive]}
                                        >
                                            <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                                {g.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </>
                    )}

                    <Text style={styles.sectionTitle}>{t.filterByIcon || 'Toegankelijkheid & taal'}</Text>
                    <View style={styles.iconList}>
                        {SAFETY_ICONS.map(icon => {
                            const active = iconFilters.has(icon.key);
                            const label = t[icon.key] || icon.key;
                            return (
                                <Pressable
                                    key={icon.key}
                                    onPress={() => toggle(iconFilters, setIconFilters, icon.key)}
                                    style={[styles.iconRow, active && styles.iconRowActive]}
                                >
                                    <Image source={{ uri: icon.url }} style={styles.iconImg} resizeMode="contain" />
                                    <Text style={[styles.iconLabel, active && styles.iconLabelActive]}>{label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Pressable style={styles.clearButton} onPress={clearAll}>
                        <Text style={styles.clearText}>{t.clearFilters || 'Wissen'}</Text>
                    </Pressable>
                    <Pressable style={styles.applyButton} onPress={onClose}>
                        <Text style={styles.applyText}>{t.close || 'Sluit'}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: colors.overlay,
    },
    sheet: {
        backgroundColor: colors.primary,
        borderTopLeftRadius: radii.xl,
        borderTopRightRadius: radii.xl,
        maxHeight: '80%',
        paddingBottom: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    title: {
        color: colors.textOnDark,
        fontSize: fontSizes.xl,
        fontFamily: fonts.bold,
    },
    body: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    sectionTitle: {
        color: colors.textOnDark,
        fontSize: fontSizes.base,
        fontFamily: fonts.semibold,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    chipGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radii.full,
    },
    chipActive: {
        backgroundColor: colors.primaryHover,
    },
    chipText: {
        color: colors.textOnDark,
        fontSize: fontSizes.sm,
        fontFamily: fonts.regular,
    },
    chipTextActive: {
        fontFamily: fonts.semibold,
    },
    iconList: {
        gap: spacing.xs,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.sm,
        borderRadius: radii.md,
    },
    iconRowActive: {
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    iconImg: {
        width: 28,
        height: 28,
    },
    iconLabel: {
        color: colors.textOnDark,
        fontSize: fontSizes.base,
        fontFamily: fonts.regular,
    },
    iconLabelActive: {
        fontFamily: fonts.semibold,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.lg,
        gap: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    clearButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: spacing.md,
        borderRadius: radii.md,
        alignItems: 'center',
    },
    clearText: {
        color: colors.textOnDark,
        fontFamily: fonts.semibold,
    },
    applyButton: {
        flex: 1,
        backgroundColor: colors.primaryHover,
        paddingVertical: spacing.md,
        borderRadius: radii.md,
        alignItems: 'center',
    },
    applyText: {
        color: colors.textOnDark,
        fontFamily: fonts.bold,
    },
});
