import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🎬',
    title: 'Upload Short Videos',
    description:
      'Create and upload vertical short-form videos to enterprise brands. Get discovered and start earning from your content.',
    gradient: ['#1a0a2e', '#0d0618'] as [string, string],
  },
  {
    id: '2',
    emoji: '📊',
    title: 'Track Your Analytics',
    description:
      'See real-time views, likes, shares, and earnings. Understand what content performs best and grow your income.',
    gradient: ['#0a1a2e', '#060d18'] as [string, string],
  },
  {
    id: '3',
    emoji: '💸',
    title: 'Earn From Every View',
    description:
      'Get paid for every view your content generates. Use referral links and CTAs to multiply your earnings.',
    gradient: ['#1a1a0a', '#0d0d06'] as [string, string],
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { completeOnboarding } = useAuthStore();

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const skip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={s => s.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.gradient}
            style={styles.slide}
          >
            <SafeAreaView style={styles.slideInner}>
              {/* Skip */}
              <TouchableOpacity style={styles.skipBtn} onPress={skip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>

              {/* Illustration */}
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>

              {/* Text */}
              <View style={styles.textBlock}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
        )}
      />

      {/* Bottom controls */}
      <SafeAreaView style={styles.bottom} edges={['bottom']}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity style={styles.btnWrap} activeOpacity={0.88} onPress={goNext}>
          <LinearGradient
            colors={['#874FE1', '#100D5B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {activeIndex === SLIDES.length - 1 ? "Let's Go 🚀" : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080e' },
  slide: { width, flex: 1 },
  slideInner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  skipBtn: { position: 'absolute', top: 16, right: 20, padding: 8 },
  skipText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  emojiWrap: {
    width: 120, height: 120, borderRadius: 36,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1, borderColor: `${Colors.primary}40`,
  },
  emoji: { fontSize: 56 },
  textBlock: { alignItems: 'center', gap: 14 },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center', lineHeight: 33 },
  description: {
    color: 'rgba(255,255,255,0.6)', fontSize: 15,
    textAlign: 'center', lineHeight: 23,
  },
  bottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 16,
    backgroundColor: 'transparent', gap: 16,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    width: 24, backgroundColor: Colors.primary,
  },
  btnWrap: { borderRadius: 14, overflow: 'hidden' },
  btn: { height: 52, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
