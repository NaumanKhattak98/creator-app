import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Dimensions, Alert, Modal, Pressable, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChartSquare, Link2, Trash, ArrowRight2, More, ArrowDown2, Notification, Setting2, TickCircle, ExportSquare, Shield, PlayCircle } from 'iconsax-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';
import { useAuthStore } from '../../../store/authStore';
import { useContentStore } from '../../../store/contentStore';
import { Video, VideoStatus } from '../../../types';
import CompanySwitcher from '../../../components/CompanySwitcher';
import ScreenBackground from '../../../components/ScreenBackground';
import VideoViewer from '../../../components/VideoViewer';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const GRID_GAP = 8;
const THUMB_W = (width - GRID_PADDING * 2 - GRID_GAP) / 2;
const THUMB_H = THUMB_W * (16 / 9);

const STATUS_DOT: Record<VideoStatus, string> = {
  live: '#02C121',
  pending: '#FE6A00',
  rejected: '#F20000',
  revise: '#874FE1',
};

const STATUS_LABEL: Record<VideoStatus, string> = {
  live: 'Live', pending: 'Pending', rejected: 'Rejected', revise: 'Revise',
};

function formatNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ─── Profile grid more-options sheet ─── */
function ProfileMoreMenu({
  visible, onClose, onAnalytics, onCopyLink, onRemove,
}: {
  visible: boolean;
  onClose: () => void;
  onAnalytics: () => void;
  onCopyLink: () => void;
  onRemove: () => void;
}) {
  const options = [
    { label: 'Analytics',          Icon: ChartSquare, action: onAnalytics, danger: false },
    { label: 'Copy Referral Link', Icon: Link2,       action: onCopyLink,  danger: false },
    { label: 'Remove Content',     Icon: Trash,       action: onRemove,    danger: true  },
  ];

  const handlePress = (action: () => void) => {
    onClose();
    setTimeout(action, 350);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={mnu.backdrop} onPress={onClose}>
        <Pressable style={mnu.sheet} onPress={() => {}}>
          <View style={mnu.handle} />
          {options.map((opt, i) => (
            <React.Fragment key={opt.label}>
              {i > 0 && <View style={mnu.divider} />}
              <TouchableOpacity style={mnu.row} onPress={() => handlePress(opt.action)} activeOpacity={0.65}>
                <View style={[mnu.iconWrap, opt.danger && mnu.iconWrapDanger]}>
                  <opt.Icon size={18} color={opt.danger ? Colors.error : Colors.primary} variant="Linear" />
                </View>
                <Text style={[mnu.label, opt.danger && mnu.labelDanger]}>{opt.label}</Text>
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

const mnu = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 10, paddingBottom: 20,
    borderTopWidth: 1, borderColor: Colors.border,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: `${Colors.primary}18`, alignItems: 'center', justifyContent: 'center' },
  iconWrapDanger: { backgroundColor: `${Colors.error}18` },
  label: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '500' },
  labelDanger: { color: Colors.error },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 20 },
});

/* ─── Grid item with more-options ─── */
function VideoGridItem({ video, onPress }: { video: Video; onPress: () => void }) {
  const router = useRouter();
  const { deleteVideo } = useContentStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const dot = STATUS_DOT[video.status];

  const handleRemove = () => {
    Alert.alert('Remove Content', 'Are you sure you want to remove this video?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteVideo(video.id) },
    ]);
  };

  return (
    <>
      <TouchableOpacity style={styles.gridItem} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.gridThumbWrap}>
          <Image source={{ uri: video.thumbnailUrl }} style={styles.gridThumb} resizeMode="cover" />

          {/* Status pill */}
          <View style={[styles.statusPill, { borderColor: dot + '55', backgroundColor: dot + '22' }]}>
            <View style={[styles.statusDot, { backgroundColor: dot }]} />
            <Text style={[styles.statusText, { color: dot }]}>{STATUS_LABEL[video.status]}</Text>
          </View>

          {/* More options button — top-right corner */}
          <TouchableOpacity
            style={styles.gridMoreBtn}
            onPress={e => { e.stopPropagation?.(); setMenuVisible(true); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <More size={15} color="#fff" variant="Linear" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <ProfileMoreMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onAnalytics={() => router.push(`/(app)/content/${video.id}`)}
        onCopyLink={() => Share.share({ message: video.analytics.referralLink })}
        onRemove={handleRemove}
      />
    </>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, switchWorkspace } = useAuthStore();
  const { videos, fetchVideos } = useContentStore();
  const [bioExpanded, setBioExpanded] = useState(false);
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  useEffect(() => {
    if (user?.activeWorkspaceId) fetchVideos(user.activeWorkspaceId);
  }, [user?.activeWorkspaceId]);

  if (!user) return null;

  const company = user.workspaces.find(w => w.id === user.activeWorkspaceId);
  const companyVideos = videos.filter(v => v.workspaceId === user.activeWorkspaceId);

  const bioPreview = user.bio.length > 80 && !bioExpanded
    ? user.bio.slice(0, 80) + '…'
    : user.bio;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      {/* Top bar */}
      <View style={styles.topBar}>
        {/* Company badge — tappable to switch company */}
        <TouchableOpacity
          style={styles.companyBadge}
          onPress={() => setSwitcherVisible(true)}
          activeOpacity={0.75}
        >
          {company?.logo ? (
            <Image source={{ uri: company.logo }} style={styles.companyBadgeLogo} />
          ) : (
            <View style={[styles.companyBadgeLogo, { backgroundColor: Colors.primary }]} />
          )}
          <View>
            <Text style={styles.companyBadgeName}>{company?.name ?? 'No Company'}</Text>
            <Text style={styles.companyBadgeHandle}>{user.username}</Text>
          </View>
          <ArrowDown2 size={14} color={Colors.textSecondary} variant="Linear" />
        </TouchableOpacity>
        {/* Notification icon */}
        <TouchableOpacity style={styles.bellBtn}>
          <Notification size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
      </View>

      {/* Workspace switcher sheet */}
      <CompanySwitcher
        visible={switcherVisible}
        companies={user.workspaces}
        activeCompanyId={user.activeWorkspaceId}
        onSelect={switchWorkspace}
        onClose={() => setSwitcherVisible(false)}
      />

      <ScrollView style={{ marginTop: 8 }} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={styles.bannerWrap}>
          <Image source={{ uri: user.bannerImage }} style={styles.banner} resizeMode="cover" />
          {/* Settings gear */}
          <TouchableOpacity
            style={styles.gearBtn}
            onPress={() => router.push('/(app)/profile/settings')}
          >
            <Setting2 size={18} color="#fff" variant="Linear" />
          </TouchableOpacity>
        </View>

        {/* Avatar + Stats row */}
        <View style={styles.avatarStatsRow}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            {company?.logo && (
              <Image source={{ uri: company.logo }} style={styles.avatarBadge} />
            )}
          </View>
          <View style={styles.statsRow}>
            <StatItem value={String(companyVideos.length)} label="Posts" />
            <StatItem value={formatNum(user.followers)} label="Followers" />
            <StatItem value={formatNum(user.totalViews)} label="Views" />
          </View>
        </View>

        {/* Identity */}
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            {user.kycCompleted && (
              <TickCircle size={18} color="#5B9FED" variant="Linear" style={{ marginLeft: 4 }} />
            )}
          </View>
          {user.bio ? (
            <Text style={styles.bio}>
              {bioPreview}
              {user.bio.length > 80 && (
                <Text style={styles.readMore} onPress={() => setBioExpanded(!bioExpanded)}>
                  {bioExpanded ? ' Show less' : ' Read More...'}
                </Text>
              )}
            </Text>
          ) : null}

          {/* Live Profile link */}
          <TouchableOpacity style={styles.liveProfile}>
            <Text style={styles.liveProfileText}>Live Profile</Text>
            <ExportSquare size={12} color={Colors.primary} variant="Linear" />
          </TouchableOpacity>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editWrapper}
            onPress={() => router.push('/(app)/profile/edit')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#874FE1', '#100D5B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.editBtn}
            >
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => Alert.alert('Share', 'Share profile coming soon.')}
          >
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* KYC notice */}
        {!user.kycCompleted && (
          <TouchableOpacity
            style={styles.kycBanner}
            onPress={() => router.push('/(app)/profile/settings/kyc')}
          >
            <Shield size={18} color={Colors.primary} variant="Linear" />
            <Text style={styles.kycBannerText}>Complete KYC to start uploading</Text>
            <ArrowRight2 size={16} color={Colors.primary} variant="Linear" />
          </TouchableOpacity>
        )}

        {/* Video Grid */}
        <View style={styles.gridSection}>
          {companyVideos.length === 0 ? (
            <View style={styles.emptyGrid}>
              <View style={styles.emptyIconWrap}>
                <PlayCircle size={32} color={Colors.textMuted} variant="Linear" />
              </View>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyHint}>Upload content to an enterprise to start earning!</Text>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => router.push('/(app)/upload')}
              >
                <Text style={styles.uploadBtnText}>Upload</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {companyVideos.map((v, i) => (
                <VideoGridItem key={v.id} video={v} onPress={() => openViewer(i)} />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* TikTok-style video viewer */}
      <VideoViewer
        visible={viewerVisible}
        videos={companyVideos}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080e' },

  /* Top bar */
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  companyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceMedium,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6,
  },
  companyBadgeLogo: { width: 32, height: 32, borderRadius: 8 },
  companyBadgeName: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  companyBadgeHandle: { color: Colors.textSecondary, fontSize: 11 },
  bellBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceMedium,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Banner */
  bannerWrap: { height: 140, position: 'relative' },
  banner: { width: '100%', height: '100%' },
  gearBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Avatar + stats row */
  avatarStatsRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, marginTop: -36,
    justifyContent: 'space-between',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 88, height: 88, borderRadius: 14,
    borderWidth: 3, borderColor: Colors.background,
    backgroundColor: Colors.surface,
  },
  avatarBadge: {
    position: 'absolute', bottom: -6, right: -6,
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 2, borderColor: Colors.background,
  },
  statsRow: { flexDirection: 'row', gap: 20, paddingBottom: 8 },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  statLabel: { color: Colors.textSecondary, fontSize: 11 },

  /* Identity */
  identity: { paddingHorizontal: 16, paddingTop: 14, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  bio: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 2 },
  readMore: { color: Colors.primary, fontSize: 13 },
  liveProfile: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4,
  },
  liveProfileText: { color: Colors.primary, fontSize: 12, fontWeight: '500' },

  /* Action buttons */
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  editWrapper: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  editBtn: { height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  editBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  shareBtn: {
    flex: 1, height: 40, alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  shareBtnText: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  /* KYC banner */
  kycBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: `${Colors.primary}18`,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: `${Colors.primary}44`,
  },
  kycBannerText: { flex: 1, color: Colors.primary, fontSize: 13, fontWeight: '500' },

  /* Grid */
  gridSection: { paddingHorizontal: GRID_PADDING },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  gridItem: { width: THUMB_W },
  gridThumbWrap: {
    width: THUMB_W, height: THUMB_H,
    borderRadius: 10, overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  gridThumb: { width: '100%', height: '100%' },
  statusPill: {
    position: 'absolute', top: 6, left: 6,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '600' },
  gridMoreBtn: {
    position: 'absolute', top: 6, right: 6,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Empty grid */
  emptyGrid: {
    alignItems: 'center', paddingVertical: 48, gap: 10, width: '100%',
  },
  emptyIconWrap: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: Colors.surfaceMedium,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  emptyHint: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  uploadBtn: {
    marginTop: 8, borderWidth: 1, borderColor: Colors.primary,
    paddingHorizontal: 32, paddingVertical: 10, borderRadius: 20,
  },
  uploadBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
