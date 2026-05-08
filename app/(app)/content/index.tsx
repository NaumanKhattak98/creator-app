import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Image, Modal, Pressable,
  TextInput, ScrollView, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Edit2, ChartSquare, Link2, Trash, ArrowRight2, More, ArrowDown2, SearchNormal1, PlayCircle } from 'iconsax-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { useAuthStore } from '../../../store/authStore';
import { useContentStore } from '../../../store/contentStore';
import { Video, VideoStatus } from '../../../types';
import CompanySwitcher from '../../../components/CompanySwitcher';
import ScreenBackground from '../../../components/ScreenBackground';
import VideoViewer from '../../../components/VideoViewer';

const STATUS_LABELS: Record<VideoStatus, string> = {
  live: 'Live', pending: 'Pending', rejected: 'Rejected', revise: 'Revise',
};

const STATUS_TEXT_COLORS: Record<VideoStatus, string> = {
  live: '#02C121',
  pending: '#FE6A00',
  rejected: '#F20000',
  revise: '#874FE1',
};

type FilterType = 'All' | VideoStatus;
const FILTERS: FilterType[] = ['All', 'live', 'pending', 'revise', 'rejected'];
const FILTER_LABELS: Record<FilterType, string> = {
  All: 'All', live: 'Live', pending: 'Pending', revise: 'Revise', rejected: 'Rejected',
};

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/* ─── More Options Sheet ─── */
type MoreMenuProps = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAnalytics: () => void;
  onCopyLink: () => void;
  onRemove: () => void;
};

function MoreMenu({ visible, onClose, onEdit, onAnalytics, onCopyLink, onRemove }: MoreMenuProps) {
  const options = [
    { label: 'Edit Content',        Icon: Edit2,       action: onEdit,      danger: false },
    { label: 'Analytics',           Icon: ChartSquare, action: onAnalytics, danger: false },
    { label: 'Copy Referral Link',  Icon: Link2,       action: onCopyLink,  danger: false },
    { label: 'Remove Content',      Icon: Trash,       action: onRemove,    danger: true  },
  ];

  const handlePress = (action: () => void) => {
    onClose();
    // Wait for modal to fully dismiss before navigating
    setTimeout(action, 350);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={menu.backdrop} onPress={onClose}>
        <Pressable style={menu.sheet} onPress={() => {}}>
          {/* Handle bar */}
          <View style={menu.handle} />
          {options.map((opt, i) => (
            <React.Fragment key={opt.label}>
              {i > 0 && <View style={menu.divider} />}
              <TouchableOpacity
                style={menu.row}
                onPress={() => handlePress(opt.action)}
                activeOpacity={0.65}
              >
                <View style={[menu.iconWrap, opt.danger && menu.iconWrapDanger]}>
                  <opt.Icon
                    size={18}
                    color={opt.danger ? Colors.error : Colors.primary}
                    variant="Linear"
                  />
                </View>
                <Text style={[menu.label, opt.danger && menu.labelDanger]}>{opt.label}</Text>
                <ArrowRight2 size={16} color={Colors.textMuted} variant="Linear" />
              </TouchableOpacity>
            </React.Fragment>
          ))}
          <View style={{ height: 16 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const menu = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 10, paddingBottom: 20,
    borderTopWidth: 1, borderColor: Colors.border,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: 16,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, gap: 14,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: `${Colors.primary}18`,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapDanger: { backgroundColor: `${Colors.error}18` },
  label: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '500' },
  labelDanger: { color: Colors.error },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 20 },
});

/* ─── Content List Item ─── */
function ContentItem({
  video, company, onPress,
}: {
  video: Video;
  company?: { logo: string; name: string };
  onPress: () => void;
}) {
  const router = useRouter();
  const { deleteVideo } = useContentStore();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleRemove = () => {
    Alert.alert('Remove Content', 'Are you sure you want to remove this video?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteVideo(video.id) },
    ]);
  };

  const handleCopyLink = () => {
    Share.share({ message: video.analytics.referralLink });
  };

  const openDetails = () => router.push(`/(app)/content/${video.id}`);

  return (
    <>
      {/* Tapping the whole row opens TikTok-style viewer */}
      <TouchableOpacity
        style={item.container}
        activeOpacity={0.7}
        onPress={onPress}
      >
        {/* Thumbnail */}
        <View style={item.thumbOuter}>
          <View style={item.thumbWrap}>
            <Image source={{ uri: video.thumbnailUrl }} style={item.thumb} resizeMode="cover" />
            <View style={item.durationBadge}>
              <Text style={item.durationText}>{formatDuration(video.duration)}</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={item.info}>
          <View style={item.metaRow}>
            {company?.logo ? (
              <Image source={{ uri: company.logo }} style={item.companyLogo} />
            ) : (
              <View style={[item.companyLogo, { backgroundColor: Colors.primary }]} />
            )}
            <Text style={[item.statusText, { color: STATUS_TEXT_COLORS[video.status] }]}>
              {STATUS_LABELS[video.status]}
            </Text>
          </View>
          <Text style={item.title} numberOfLines={1}>{video.title}</Text>
          <Text style={item.description} numberOfLines={2}>{video.description}</Text>
        </View>

        {/* More button — stops propagation so it doesn't open details */}
        <TouchableOpacity
          style={item.moreBtn}
          onPress={e => { e.stopPropagation?.(); setMenuVisible(true); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <More size={20} color={Colors.textSecondary} variant="Linear" />
        </TouchableOpacity>
      </TouchableOpacity>

      <MoreMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onEdit={() => router.push(`/(app)/content/edit/${video.id}`)}
        onAnalytics={openDetails}
        onCopyLink={handleCopyLink}
        onRemove={handleRemove}
      />
    </>
  );
}

const item = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  thumbOuter: {
    width: 104, height: 84, borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbWrap: {
    width: 48, height: 184, borderRadius: 8, overflow: 'hidden',
    backgroundColor: Colors.surfaceMedium,
  },
  thumb: { width: '100%', height: '100%' },
  durationBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20,
  },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  info: { flex: 1, gap: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  companyLogo: { width: 24, height: 24, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '500' },
  title: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  description: { color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 17 },
  moreBtn: { paddingHorizontal: 4, paddingTop: 2, transform: [{ rotate: '90deg' }] },
});

/* ─── Empty State ─── */
function EmptyState() {
  const router = useRouter();
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <PlayCircle size={32} color={Colors.textMuted} variant="Linear" />
      </View>
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptyHint}>Upload content to an enterprise to start earning!</Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => router.push('/(app)/upload')}
      >
        <Text style={styles.emptyBtnText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─── No Search Results ─── */
function NoSearchResults({ term, onClear }: { term: string; onClear: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <SearchNormal1 size={28} color={Colors.textMuted} variant="Linear" />
      </View>
      <Text style={styles.emptyTitle}>No results found</Text>
      <Text style={styles.emptyHint}>
        No content available for{' '}
        <Text style={styles.emptyHighlight}>&ldquo;{term}&rdquo;</Text>
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onClear}>
        <Text style={styles.emptyBtnText}>Clear Search</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─── Main Screen ─── */
export default function ContentScreen() {
  const { user, switchWorkspace } = useAuthStore();
  const { videos, isLoading, fetchVideos } = useContentStore();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    if (user?.activeWorkspaceId) fetchVideos(user.activeWorkspaceId);
  }, [user?.activeWorkspaceId]);

  const company = user?.workspaces.find(w => w.id === user.activeWorkspaceId);

  const filtered = videos.filter(v => {
    const matchFilter = activeFilter === 'All' || v.status === activeFilter;
    const matchSearch = !search.trim() || v.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      {/* Header — company badge + title */}
      <View style={styles.header}>
        {/* Company badge (tappable) */}
        {company ? (
          <TouchableOpacity
            style={styles.companyBadge}
            onPress={() => setSwitcherVisible(true)}
            activeOpacity={0.75}
          >
            {company.logo ? (
              <Image source={{ uri: company.logo }} style={styles.companyLogo} />
            ) : (
              <View style={[styles.companyLogo, { backgroundColor: Colors.primary }]} />
            )}
            <ArrowDown2 size={14} color={Colors.textSecondary} variant="Linear" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 56 }} />
        )}
        <Text style={styles.headerTitle}>Content</Text>
        <View style={{ width: 56 }} />
      </View>

      {/* Workspace switcher sheet */}
      {user && (
        <CompanySwitcher
          visible={switcherVisible}
          companies={user.workspaces}
          activeCompanyId={user.activeWorkspaceId}
          onSelect={switchWorkspace}
          onClose={() => setSwitcherVisible(false)}
        />
      )}

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search Content"
            placeholderTextColor={Colors.textSecondary}
          />
          <SearchNormal1 size={18} color={Colors.textSecondary} variant="Linear" />
        </View>
      </View>

      {/* Filter chips — fixed height row */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterLabel, activeFilter === f && styles.filterLabelActive]}>
                {FILTER_LABELS[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content list */}
      {isLoading ? (
        <View style={styles.center}>
          <Text style={{ color: Colors.textSecondary }}>Loading…</Text>
        </View>
      ) : filtered.length === 0 && search.trim() ? (
        <NoSearchResults term={search.trim()} onClear={() => setSearch('')} />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={v => v.id}
          style={{ marginTop: 8 }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item: video, index }) => (
            <ContentItem
              video={video}
              company={company}
              onPress={() => openViewer(index)}
            />
          )}
        />
      )}
      {/* TikTok-style video viewer */}
      <VideoViewer
        visible={viewerVisible}
        videos={filtered}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
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
  headerTitle: {
    color: Colors.text, fontSize: 20, fontWeight: '700',
    flex: 1, textAlign: 'center',
  },
  companyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceMedium,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5,
  },
  companyLogo: { width: 24, height: 24, borderRadius: 6 },

  searchWrap: { paddingHorizontal: 12, marginTop: 8, marginBottom: 6 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(182,182,182,0.3)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, gap: 8,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14, paddingVertical: 0 },

  /* Filter row — explicit height so chips are never clipped */
  filterContainer: { height: 46, justifyContent: 'center' },
  filterRow: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  filterLabelActive: { color: '#fff', fontWeight: '600' },

  list: { paddingHorizontal: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.surfaceMedium,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  emptyHint: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  emptyBtn: {
    marginTop: 8, borderWidth: 1, borderColor: Colors.primary,
    paddingHorizontal: 36, paddingVertical: 10, borderRadius: 20,
  },
  emptyBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  emptyHighlight: { color: Colors.text, fontWeight: '600' },
});
