import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft2, DocumentText1, TrendUp, CloseCircle, RefreshCircle, Wallet, Money, CloudAdd } from 'iconsax-react-native';
import { Colors } from '../../../../constants/colors';
import ScreenBackground from '../../../../components/ScreenBackground';

type NotifFilter = 'All' | 'Listings' | 'Payments' | 'Analysis' | 'Jobs';
const FILTERS: NotifFilter[] = ['All', 'Listings', 'Payments', 'Analysis', 'Jobs'];

type Notification = {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  company?: string;
  message: string;
  boldName?: string;
  type: NotifFilter;
  dateGroup: 'Today' | 'Yesterday' | 'This Week';
};

const NOTIFICATION_ICON_MAP: Record<string, React.ComponentType<any>> = {
  'document-outline': DocumentText1,
  'trending-up-outline': TrendUp,
  'close-circle-outline': CloseCircle,
  'refresh-circle-outline': RefreshCircle,
  'wallet-outline': Wallet,
  'cash-outline': Money,
  'cloud-upload-outline': CloudAdd,
};

const NOTIFICATION_ICON_VARIANT: Record<string, string> = {
  'close-circle-outline': 'Bulk',
};

const NOTIFICATIONS: Notification[] = [
  {
    id: '1', icon: 'document-outline', iconColor: '#02C121', iconBg: 'rgba(2,193,33,0.1)',
    company: 'Kayak', message: 'Your upload was approved and is Live',
    type: 'Listings', dateGroup: 'Today',
  },
  {
    id: '2', icon: 'trending-up-outline', iconColor: '#02C121', iconBg: 'rgba(2,193,33,0.1)',
    company: 'Mindmatrix', message: 'Your upload is getting attention!',
    type: 'Analysis', dateGroup: 'Today',
  },
  {
    id: '3', icon: 'close-circle-outline', iconColor: '#F20000', iconBg: 'rgba(242,0,0,0.1)',
    company: 'Kayak', message: 'Your upload was rejected',
    type: 'Listings', dateGroup: 'Yesterday',
  },
  {
    id: '4', icon: 'refresh-circle-outline', iconColor: '#FD8C1B', iconBg: 'rgba(253,140,27,0.1)',
    company: 'Kayak', message: 'Your upload requires a revision',
    type: 'Listings', dateGroup: 'Yesterday',
  },
  {
    id: '5', icon: 'wallet-outline', iconColor: '#02C121', iconBg: 'rgba(2,193,33,0.1)',
    company: 'Kayak', message: 'You have initiated a withdrawal of $1900',
    type: 'Payments', dateGroup: 'This Week',
  },
  {
    id: '6', icon: 'cash-outline', iconColor: '#02C121', iconBg: 'rgba(2,193,33,0.1)',
    message: 'You earnings are growing!', boldName: 'Chris Bukard',
    type: 'Analysis', dateGroup: 'This Week',
  },
  {
    id: '7', icon: 'cloud-upload-outline', iconColor: '#02C121', iconBg: 'rgba(2,193,33,0.1)',
    message: 'Upload more content to boost your earnings', boldName: 'Chris Bukard',
    type: 'Jobs', dateGroup: 'This Week',
  },
];

const DATE_GROUPS = ['Today', 'Yesterday', 'This Week'] as const;

export default function NotificationsScreen() {
  const router = useRouter();
  const [active, setActive] = useState<NotifFilter>('All');

  const filtered = active === 'All'
    ? NOTIFICATIONS
    : NOTIFICATIONS.filter(n => n.type === active);

  // Group by date
  const grouped = DATE_GROUPS
    .map(group => ({ group, items: filtered.filter(n => n.dateGroup === group) }))
    .filter(g => g.items.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft2 size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 8 }}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, active === f && styles.chipActive]}
            onPress={() => setActive(f)}
          >
            <Text style={[styles.chipText, active === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notifications grouped by date */}
      <FlatList
        data={grouped}
        keyExtractor={g => g.group}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: group }) => (
          <View>
            <Text style={styles.dateHeader}>{group.group}</Text>
            {group.items.map(item => (
              <View key={item.id} style={styles.notifRow}>
                <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                  {(() => { const NIcon = NOTIFICATION_ICON_MAP[item.icon]; return NIcon ? <NIcon size={22} color={item.iconColor} variant={NOTIFICATION_ICON_VARIANT[item.icon] ?? 'Linear'} /> : null; })()}
                </View>
                <View style={styles.notifText}>
                  {item.company && (
                    <Text style={styles.companyName}>{item.company}</Text>
                  )}
                  <Text style={styles.message}>{item.message}</Text>
                  {item.boldName && (
                    <Text style={styles.boldName}>{item.boldName}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      />
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

  filterRow: {
    paddingHorizontal: 16, paddingBottom: 10, gap: 8, flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 8, paddingTop: 5, paddingBottom: 6,
    borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(182,182,182,0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  chipText: { color: Colors.text, fontSize: 14 },
  chipTextActive: { color: '#000' },

  list: { paddingHorizontal: 16, paddingBottom: 24 },
  dateHeader: {
    color: Colors.textMuted, fontSize: 12, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: 16, marginBottom: 4,
  },
  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 8, gap: 12,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  notifText: { flex: 1, justifyContent: 'center' },
  companyName: { color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 18 },
  message: { color: Colors.text, fontSize: 14, lineHeight: 21 },
  boldName: { color: Colors.text, fontSize: 14, fontWeight: '700', lineHeight: 21 },
});
