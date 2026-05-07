import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Decorative full-screen background — dark base with blue/purple radial glows.
 * Place as the FIRST child of any screen's root View / SafeAreaView.
 * Already `position: absolute` so it doesn't affect layout.
 */
export default function ScreenBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { opacity: 0.5 }]} pointerEvents="none">
      {/* Deep dark base */}
      <LinearGradient
        colors={['#0e0b1f', '#09090e']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Purple glow — top-right corner */}
      <LinearGradient
        colors={['#4a1e9050', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.2, y: 0.55 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Blue glow — bottom-left corner */}
      <LinearGradient
        colors={['transparent', '#0d1e5545']}
        start={{ x: 0.7, y: 0.45 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}
