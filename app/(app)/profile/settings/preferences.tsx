import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft2, Moon, Global, VolumeHigh, Video, Wifi, Eye, Lock, ArrowRight2 } from 'iconsax-react-native';
import { Colors } from '../../../../constants/colors';
import ScreenBackground from '../../../../components/ScreenBackground';

type PrefRow = {
  icon: string;
  label: string;
  subtitle?: string;
  toggle?: boolean;
};

const PREFERENCES: PrefRow[] = [
  { icon: 'moon-outline',            label: 'Dark Mode',               toggle: true },
  { icon: 'language-outline',        label: 'Auto-translate Content',  toggle: false },
  { icon: 'volume-high-outline',     label: 'Sound Effects',           toggle: true },
  { icon: 'videocam-outline',        label: 'Auto-play Videos',        toggle: true, subtitle: 'Videos play automatically in feed' },
  { icon: 'wifi-outline',            label: 'Download on Wi-Fi Only',  toggle: true },
  { icon: 'eye-outline',             label: 'Content Quality',         subtitle: 'Auto (Recommended)' },
  { icon: 'lock-closed-outline',     label: 'App Permissions',         subtitle: 'Camera, Media, Notifications' },
];

const PREF_ICON_MAP: Record<string, React.ComponentType<any>> = {
  'moon-outline': Moon,
  'language-outline': Global,
  'volume-high-outline': VolumeHigh,
  'videocam-outline': Video,
  'wifi-outline': Wifi,
  'eye-outline': Eye,
  'lock-closed-outline': Lock,
};

export default function PreferencesScreen() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    'Dark Mode': true,
    'Auto-translate Content': false,
    'Sound Effects': true,
    'Auto-play Videos': true,
    'Download on Wi-Fi Only': true,
  });

  const toggle = (label: string) =>
    setPrefs(p => ({ ...p, [label]: !p[label] }));

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft2 size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.title}>Preferences</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ marginTop: 8 }} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {PREFERENCES.map((pref, i) => {
          const PrefIcon = PREF_ICON_MAP[pref.icon];
          return (
          <View key={pref.label} style={styles.row}>
            <View style={styles.iconWrap}>
              <PrefIcon size={18} color={Colors.primary} variant="Linear" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.label}>{pref.label}</Text>
              {pref.subtitle && <Text style={styles.subtitle}>{pref.subtitle}</Text>}
            </View>
            {pref.toggle !== undefined ? (
              <Switch
                value={prefs[pref.label] ?? false}
                onValueChange={() => toggle(pref.label)}
                trackColor={{ false: Colors.surfaceMedium, true: Colors.primary }}
                thumbColor="#fff"
                ios_backgroundColor={Colors.surfaceMedium}
              />
            ) : (
              <ArrowRight2 size={16} color={Colors.textMuted} variant="Linear" />
            )}
          </View>
          );
        })}
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
  list: { padding: 16, gap: 10, paddingBottom: 48 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceMedium,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, gap: 14,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: `${Colors.primary}22`,
    alignItems: 'center', justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  label: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  subtitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
});
