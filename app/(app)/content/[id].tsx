import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft2, DollarCircle, Eye, Heart, Message, ArrowRotateRight, Clock, People, UserAdd } from 'iconsax-react-native';
import { Colors } from '../../../constants/colors';
import { useContentStore } from '../../../store/contentStore';
import { AnalyticsFilter } from '../../../types';

const FILTERS: AnalyticsFilter[] = ['1W', '4W', '1Y', 'MTD', 'QTD', 'YTD', 'ALL'];

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatIncome(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n}`;
}

function formatWatchTime(s: number) {
  const h = Math.floor(s / 3600);
  if (h >= 1) return `${h} hrs`;
  const m = Math.floor(s / 60);
  return `${m} min`;
}

type StatRowProps = {
  icon: string;
  label: string;
  value: string;
  last?: boolean;
};

const STAT_ICON_MAP: Record<string, React.ComponentType<any>> = {
  'logo-usd': DollarCircle,
  'eye-outline': Eye,
  'heart-outline': Heart,
  'chatbubble-outline': Message,
  'arrow-redo-outline': ArrowRotateRight,
  'time-outline': Clock,
};

function StatRow({ icon, label, value, last }: StatRowProps) {
  const SIcon = STAT_ICON_MAP[icon];
  return (
    <View style={[stat.row, !last && stat.rowBorder]}>
      <View style={stat.left}>
        {SIcon ? <SIcon size={20} color="rgba(255,255,255,0.6)" variant="Linear" /> : null}
        <Text style={stat.label}>{label}</Text>
      </View>
      <Text style={stat.value}>{value}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  value: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default function AnalyticsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { videos } = useContentStore();
  const video = videos.find(v => v.id === id);
  const [filter, setFilter] = useState<AnalyticsFilter>('4W');

  if (!video) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: Colors.textSecondary }}>Video not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { analytics } = video;

  const handleCopyLink = () => {
    Share.share({ message: analytics.referralLink });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft2 size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={{ marginTop: 8 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Portrait Thumbnail */}
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={styles.thumb}
            resizeMode="cover"
          />
          <View style={styles.thumbGradient} />
        </View>

        {/* Title & Description */}
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{video.title}</Text>
          <Text style={styles.description}>{video.description}</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stat Rows */}
        <View style={styles.statsBlock}>
          <StatRow icon="logo-usd" label="Income" value={formatIncome(analytics.income)} />
          <StatRow icon="eye-outline" label="Views" value={formatNum(analytics.views)} />
          <StatRow icon="heart-outline" label="Likes" value={formatNum(analytics.likes)} />
          <StatRow icon="chatbubble-outline" label="Comments" value={formatNum(analytics.comments)} />
          <StatRow icon="arrow-redo-outline" label="Shares" value={formatNum(analytics.shares)} />
          <StatRow icon="time-outline" label="Watchtime" value={formatWatchTime(analytics.watchTime)} last />
        </View>

        {/* Traffic & Referrals Card */}
        <View style={styles.trafficCard}>
          {/* Total Traffic */}
          <View style={[stat.row, stat.rowBorder]}>
            <View style={stat.left}>
              <People size={20} color="rgba(255,255,255,0.6)" variant="Linear" />
              <Text style={stat.label}>Total Traffic</Text>
            </View>
            <Text style={stat.value}>{formatNum(analytics.totalTraffic)}</Text>
          </View>

          {/* Your Referrals */}
          <View style={stat.row}>
            <View style={stat.left}>
              <UserAdd size={20} color="rgba(255,255,255,0.6)" variant="Linear" />
              <View style={styles.referralLabelRow}>
                <Text style={stat.label}>Your Referrals</Text>
                <TouchableOpacity onPress={handleCopyLink}>
                  <Text style={styles.copyLink}>Copy link</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={stat.value}>{formatNum(Math.floor(analytics.totalTraffic * 0.26))}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  scroll: { paddingHorizontal: 16, alignItems: 'center' },

  /* Thumbnail */
  thumbWrap: {
    width: 144, height: 249, borderRadius: 10, overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated, marginBottom: 16,
  },
  thumb: { width: '100%', height: '100%' },
  thumbGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    backgroundColor: 'rgba(0,0,0,0)',
  },

  /* Title block */
  titleBlock: { width: '100%', gap: 4, marginBottom: 12 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  description: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 21 },

  /* Filter tabs */
  filterRow: {
    flexDirection: 'row', width: '100%', marginBottom: 4,
  },
  filterTab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 7, borderRadius: 12,
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  filterTextActive: { color: '#fff', fontWeight: '500' },

  /* Stats */
  statsBlock: { width: '100%', marginBottom: 8 },

  /* Traffic card */
  trafficCard: {
    width: '100%',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, paddingHorizontal: 12,
  },

  /* Referrals */
  referralLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  copyLink: { color: Colors.primary, fontSize: 12 },
});
