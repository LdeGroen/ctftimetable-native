// SettingsScreen — notificatie-voorkeuren en taalkeuze.

import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView, Alert, Linking, Platform } from 'react-native';
import { Bell, Globe } from 'lucide-react-native';

import { colors, spacing, radii, fontSizes, fonts } from '../theme';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';

const MINUTES_OPTIONS = [5, 10, 15, 30, 60];

export default function SettingsScreen() {
    const {
        language, changeLanguage,
        notifPrefs, notifPermission,
        setNotificationsEnabled, setMinutesBefore,
        favorites,
    } = useApp();
    const t = translations[language]?.common ?? {};

    const handleToggle = async (val) => {
        const ok = await setNotificationsEnabled(val);
        if (val && !ok) {
            Alert.alert(
                t.permissionDenied || 'Geen toestemming',
                t.permissionDeniedExplain || 'De app heeft geen permissie om notificaties te versturen. Open instellingen om dit aan te passen.',
                [
                    { text: t.cancel || 'Annuleer' },
                    { text: t.openSettings || 'Open instellingen', onPress: () => Linking.openSettings() },
                ]
            );
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Globe size={20} color={colors.textOnDark} />
                    <Text style={styles.sectionHeading}>{t.language || 'Taal'}</Text>
                </View>
                <View style={styles.chipRow}>
                    {['nl', 'en'].map(lang => (
                        <Pressable
                            key={lang}
                            onPress={() => changeLanguage(lang)}
                            style={[styles.chip, language === lang && styles.chipActive]}
                        >
                            <Text style={[styles.chipText, language === lang && styles.chipTextActive]}>
                                {lang.toUpperCase()}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Bell size={20} color={colors.textOnDark} />
                    <Text style={styles.sectionHeading}>{t.notifications || 'Notificaties'}</Text>
                </View>

                <View style={styles.row}>
                    <View style={styles.rowLabels}>
                        <Text style={styles.label}>{t.notificationsEnabled || 'Notificaties aan'}</Text>
                        <Text style={styles.sublabel}>
                            {t.notificationsExplain || 'Krijg een herinnering voor je favoriete voorstellingen'}
                        </Text>
                    </View>
                    <Switch
                        value={notifPrefs.enabled && notifPermission}
                        onValueChange={handleToggle}
                        trackColor={{ true: colors.primaryHover, false: '#9ca3af' }}
                        thumbColor={Platform.OS === 'android' ? colors.textOnDark : undefined}
                    />
                </View>

                {notifPrefs.enabled && notifPermission && (
                    <>
                        <Text style={[styles.label, { marginTop: spacing.md }]}>
                            {t.minutesBefore || 'Minuten van tevoren'}
                        </Text>
                        <View style={styles.chipRow}>
                            {MINUTES_OPTIONS.map(min => (
                                <Pressable
                                    key={min}
                                    onPress={() => setMinutesBefore(min)}
                                    style={[styles.chip, notifPrefs.minutesBefore === min && styles.chipActive]}
                                >
                                    <Text style={[styles.chipText, notifPrefs.minutesBefore === min && styles.chipTextActive]}>
                                        {min} min
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <View style={styles.statBlock}>
                            <Text style={styles.statText}>
                                {favorites.size} {(t.favoritesScheduled || 'favorieten ingepland').toLowerCase()}
                            </Text>
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    section: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: radii.lg,
        padding: spacing.md,
        gap: spacing.sm,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    sectionHeading: {
        color: colors.textOnDark,
        fontFamily: fonts.bold,
        fontSize: fontSizes.lg,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    rowLabels: {
        flex: 1,
    },
    label: {
        color: colors.textOnDark,
        fontFamily: fonts.semibold,
        fontSize: fontSizes.base,
    },
    sublabel: {
        color: colors.textOnDark,
        opacity: 0.7,
        fontFamily: fonts.regular,
        fontSize: fontSizes.sm,
        marginTop: 2,
    },
    chipRow: {
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
        fontFamily: fonts.regular,
        fontSize: fontSizes.sm,
    },
    chipTextActive: {
        fontFamily: fonts.bold,
    },
    statBlock: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
    },
    statText: {
        color: colors.textOnDark,
        opacity: 0.8,
        fontFamily: fonts.regular,
        fontSize: fontSizes.sm,
    },
});
