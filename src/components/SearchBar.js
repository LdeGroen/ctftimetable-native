// SearchBar — native TextInput met search-icoon.

import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';

import { colors, spacing, radii, fontSizes, fonts } from '../theme';

export default function SearchBar({ value, onChange, placeholder }) {
    return (
        <View style={styles.container}>
            <Search size={18} color={colors.textSecondary} />
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                returnKeyType="search"
                autoCorrect={false}
            />
            {value?.length > 0 && (
                <Pressable hitSlop={8} onPress={() => onChange('')}>
                    <X size={18} color={colors.textSecondary} />
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.cardBackground,
        borderRadius: radii.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: fontSizes.base,
        fontFamily: fonts.regular,
        color: colors.textPrimary,
    },
});
