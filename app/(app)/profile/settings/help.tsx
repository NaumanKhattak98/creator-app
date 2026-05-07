import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft2, InfoCircle, ArrowUp2, ArrowDown2, Sms, Global, ArrowRight2 } from 'iconsax-react-native';
import { Colors } from '../../../../constants/colors';
import ScreenBackground from '../../../../components/ScreenBackground';

const FAQ = [
  {
    q: 'How do I upload a video?',
    a: 'Go to the Upload tab, tap "Tap to select" to pick a video from your library, fill in the title and description, then tap "Upload Short".',
  },
  {
    q: 'Why is my video pending?',
    a: 'Videos go through a review process before going live. This typically takes 24–48 hours. You\'ll receive a notification once your video is reviewed.',
  },
  {
    q: 'What is KYC verification?',
    a: 'KYC (Know Your Customer) is an identity verification process required before you can withdraw earnings. You\'ll need a government-issued ID and a selfie.',
  },
  {
    q: 'How do I earn money?',
    a: 'You earn based on views, engagement, and the referral link associated with each video. Income is tracked in the Analytics section.',
  },
  {
    q: 'Can I edit a video after uploading?',
    a: 'Yes. Go to the Content screen, tap ⋮ on any video, then select "Edit Content" to update the title, description, tags, or CTA.',
  },
  {
    q: 'How do I switch workspaces?',
    a: 'Tap the workspace badge in the top-left corner on the Content or Upload screen to switch between your attached workspaces.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft2 size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.title}>Help Center</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ marginTop: 8 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <InfoCircle size={36} color={Colors.primary} variant="Linear" />
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>Browse our FAQs or get in touch.</Text>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
        {FAQ.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.faqRow}
            onPress={() => setExpanded(expanded === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={styles.faqTop}>
              <Text style={styles.question}>{item.q}</Text>
              {expanded === i
                ? <ArrowUp2 size={16} color={Colors.textMuted} variant="Linear" />
                : <ArrowDown2 size={16} color={Colors.textMuted} variant="Linear" />
              }
            </View>
            {expanded === i && (
              <Text style={styles.answer}>{item.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Contact */}
        <Text style={styles.sectionLabel}>Contact Support</Text>
        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('mailto:support@creatorportal.io')}
        >
          <View style={styles.contactIcon}>
            <Sms size={20} color={Colors.primary} variant="Linear" />
          </View>
          <View style={styles.contactText}>
            <Text style={styles.contactLabel}>Email Support</Text>
            <Text style={styles.contactSub}>support@creatorportal.io</Text>
          </View>
          <ArrowRight2 size={16} color={Colors.textMuted} variant="Linear" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('https://creatorportal.io/help')}
        >
          <View style={styles.contactIcon}>
            <Global size={20} color={Colors.primary} variant="Linear" />
          </View>
          <View style={styles.contactText}>
            <Text style={styles.contactLabel}>Help Portal</Text>
            <Text style={styles.contactSub}>creatorportal.io/help</Text>
          </View>
          <ArrowRight2 size={16} color={Colors.textMuted} variant="Linear" />
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

  hero: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: `${Colors.primary}18`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  heroTitle: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  heroSub: { color: Colors.textSecondary, fontSize: 14 },

  sectionLabel: {
    color: Colors.textMuted, fontSize: 11, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: 8, marginBottom: 2, paddingLeft: 4,
  },
  faqRow: {
    backgroundColor: Colors.surfaceMedium, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  faqTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  question: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '500' },
  answer: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 10 },

  contactRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceMedium,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 14,
  },
  contactIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: `${Colors.primary}22`,
    alignItems: 'center', justifyContent: 'center',
  },
  contactText: { flex: 1 },
  contactLabel: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  contactSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
});
