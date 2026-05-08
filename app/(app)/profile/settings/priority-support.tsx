import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft2, Flash, Profile, ShieldTick, Money, Headphone, Star1, Shield, ArrowRight2 } from 'iconsax-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../../constants/colors';
import { useAuthStore } from '../../../../store/authStore';
import ScreenBackground from '../../../../components/ScreenBackground';

const BENEFITS = [
  { Icon: Flash,      text: 'Response within 2 hours' },
  { Icon: Profile,    text: 'Dedicated account manager' },
  { Icon: ShieldTick, text: 'Priority content review (< 4 hrs)' },
  { Icon: Money,      text: 'Faster withdrawal processing' },
  { Icon: Headphone,  text: 'Live chat & phone support' },
  { Icon: Star1,      text: 'Exclusive creator perks & offers' },
];

export default function PrioritySupportScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft2 size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.title}>Priority Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ marginTop: 8 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={['#874FE133', '#100D5B33']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Headphone size={40} color={Colors.primary} variant="Linear" />
          </View>
          <Text style={styles.heroTitle}>Priority Customer Service</Text>
          <Text style={styles.heroSub}>
            Unlock premium support reserved for verified creators.
          </Text>
        </LinearGradient>

        {/* Benefits */}
        <Text style={styles.sectionLabel}>What's Included</Text>
        {BENEFITS.map((b, i) => (
          <View key={i} style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <b.Icon size={18} color={Colors.primary} variant="Linear" />
            </View>
            <Text style={styles.benefitText}>{b.text}</Text>
          </View>
        ))}

        {/* Contact */}
        <Text style={styles.sectionLabel}>Get in Touch</Text>
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => Linking.openURL('mailto:priority@creatorportal.io')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#874FE1', '#100D5B']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.contactBtnGrad}
          >
            <Headphone size={20} color="#fff" variant="Linear" />
            <Text style={styles.contactBtnText}>Contact Priority Support</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080e' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '600', flex: 1, textAlign: 'center' },
  scroll: { padding: 16, gap: 10, paddingBottom: 48 },

  hero: {
    borderRadius: 16, padding: 24,
    alignItems: 'center', gap: 10, marginBottom: 4,
  },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: `${Colors.primary}22`,
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  heroSub: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  kycGate: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: `${Colors.primary}40`,
  },
  kycTitle: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  kycSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },

  sectionLabel: {
    color: Colors.textMuted, fontSize: 11, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: 6, paddingLeft: 4,
  },
  benefitRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceMedium,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 14,
  },
  benefitIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: `${Colors.primary}22`,
    alignItems: 'center', justifyContent: 'center',
  },
  benefitText: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '500' },

  contactBtn: { borderRadius: 14, overflow: 'hidden' },
  contactBtnDisabled: { opacity: 0.75 },
  contactBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 52,
  },
  contactBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
