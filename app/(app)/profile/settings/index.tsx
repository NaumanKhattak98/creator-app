import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Flag, Global, Setting4, Notification, InfoCircle, Headphone, Logout, ArrowLeft2, ArrowRight2, ShieldTick, Card } from 'iconsax-react-native';

const SETTINGS_ICON_MAP: Record<string, React.ComponentType<any>> = {
  'flag-outline': Flag,
  'language-outline': Global,
  'options-outline': Setting4,
  'notifications-outline': Notification,
  'help-circle-outline': InfoCircle,
  'headset-outline': Headphone,
  'log-out-outline': Logout,
};
import { Colors } from '../../../../constants/colors';
import { useAuthStore } from '../../../../store/authStore';
import ScreenBackground from '../../../../components/ScreenBackground';

interface RowProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsRow({ icon, label, subtitle, onPress, danger }: RowProps) {
  const SIcon = SETTINGS_ICON_MAP[icon];
  return (
    <TouchableOpacity
      style={row.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[row.iconWrap, danger && row.iconWrapDanger]}>
        {SIcon ? <SIcon size={18} color={danger ? Colors.error : Colors.primary} variant="Linear" /> : null}
      </View>
      <View style={row.textWrap}>
        <Text style={[row.label, danger && row.labelDanger]}>{label}</Text>
        {subtitle ? <Text style={row.subtitle}>{subtitle}</Text> : null}
      </View>
      <ArrowRight2 size={16} color={Colors.textMuted} variant="Linear" />
    </TouchableOpacity>
  );
}

const row = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceMedium,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    gap: 14,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: `${Colors.primary}25`,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapDanger: { backgroundColor: `${Colors.error}20` },
  textWrap: { flex: 1 },
  label: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  labelDanger: { color: Colors.error },
  subtitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
});

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();

  if (!user) return null;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft2 size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={{ marginTop: 8 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── KYC Card ── */}
        <TouchableOpacity
          style={[styles.kycCard, user.kycCompleted && styles.kycCardDone]}
          onPress={() => router.push('/(app)/profile/settings/kyc')}
          activeOpacity={0.8}
        >
          <View style={styles.kycLeft}>
            <Text style={styles.kycText}>
              {user.kycCompleted
                ? 'Your identity has been verified successfully.'
                : 'Complete the KYC process so you can withdraw your earnings'}
            </Text>
          </View>
          <View style={styles.kycRight}>
            <View style={styles.kycIconCard}>
              {user.kycCompleted
                ? <ShieldTick size={28} color="#22C55E" variant="Linear" />
                : <Card size={28} color={Colors.primary} variant="Linear" />
              }
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Menu Rows ── */}
        <SettingsRow
          icon="flag-outline"
          label="Country"
          subtitle={user.country || undefined}
          onPress={() => router.push('/(app)/profile/settings/country')}
        />

        <SettingsRow
          icon="language-outline"
          label="Language"
          subtitle={user.language || undefined}
          onPress={() => router.push('/(app)/profile/settings/language')}
        />

        <SettingsRow
          icon="options-outline"
          label="Preferences"
          onPress={() => router.push('/(app)/profile/settings/preferences')}
        />

        <SettingsRow
          icon="notifications-outline"
          label="Notifications and Permissions"
          onPress={() => router.push('/(app)/profile/settings/notifications')}
        />

        <SettingsRow
          icon="help-circle-outline"
          label="Help"
          onPress={() => router.push('/(app)/profile/settings/help')}
        />

        <SettingsRow
          icon="headset-outline"
          label="Priority Customer Service"
          onPress={() => router.push('/(app)/profile/settings/priority-support')}
        />

        <SettingsRow
          icon="log-out-outline"
          label="Logout"
          danger
          onPress={handleLogout}
        />

        <Text style={styles.version}>Creator App v1.0.0</Text>
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
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },

  scroll: { padding: 16, gap: 10, paddingBottom: 48 },

  /* KYC card */
  kycCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${Colors.primary}12`,
    borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.primary,
    borderStyle: 'dashed',
    padding: 16, gap: 12,
  },
  kycCardDone: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderColor: '#22C55E',
  },
  kycLeft: { flex: 1 },
  kycText: {
    color: Colors.text, fontSize: 13, lineHeight: 19,
  },
  kycRight: {},
  kycIconCard: {
    width: 56, height: 56, borderRadius: 10,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center', justifyContent: 'center',
  },

  version: {
    color: Colors.textMuted, fontSize: 12,
    textAlign: 'center', marginTop: 16,
  },
});
