import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.wrapper, style]}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#874FE1', '#100D5B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseBtn,
        variant === 'outline' ? styles.outline : styles.ghost,
        style,
      ]}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : (
        <Text style={[styles.outlineText, variant === 'ghost' && styles.ghostText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 12, overflow: 'hidden' },
  gradient: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  baseBtn: { height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingHorizontal: 24 },
  outline: { borderWidth: 1.5, borderColor: Colors.primary },
  ghost: {},
  outlineText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  ghostText: { color: Colors.textSecondary },
});
