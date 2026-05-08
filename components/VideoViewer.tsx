import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Modal, StatusBar, Share, Alert, Pressable,
  LayoutChangeEvent, ActivityIndicator,
} from 'react-native';
import { Video as ExpoVideo, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChartSquare, Link2, Trash, ArrowRight2, ArrowLeft2, More,
  Heart, Messages3, Bookmark, ArrowRotateRight, Add, Calendar1,
  VolumeHigh, VolumeCross, Play,
} from 'iconsax-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useContentStore } from '../store/contentStore';
import { Video as VideoType } from '../types';
import { Colors } from '../constants/colors';

/* ─── Helpers ─── */
function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function statusColor(s: string) {
  if (s === 'live') return '#02C121';
  if (s === 'pending') return '#FE6A00';
  if (s === 'rejected') return '#F20000';
  return Colors.primary;
}

/* ─── More-options bottom sheet ─── */
function MoreSheet({
  visible, onClose, onAnalytics, onCopyLink, onRemove,
}: {
  visible: boolean;
  onClose: () => void;
  onAnalytics: () => void;
  onCopyLink: () => void;
  onRemove: () => void;
}) {
  const run = (fn: () => void) => { onClose(); setTimeout(fn, 320); };

  const opts = [
    { Icon: ChartSquare, label: 'Analytics',          fn: onAnalytics, danger: false },
    { Icon: Link2,       label: 'Copy Referral Link', fn: onCopyLink,  danger: false },
    { Icon: Trash,       label: 'Remove Content',     fn: onRemove,    danger: true  },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={sh.backdrop} onPress={onClose}>
        <Pressable style={sh.sheet} onPress={() => {}}>
          <View style={sh.handle} />
          {opts.map((o, i) => (
            <React.Fragment key={o.label}>
              {i > 0 && <View style={sh.divider} />}
              <TouchableOpacity style={sh.row} onPress={() => run(o.fn)} activeOpacity={0.65}>
                <View style={[sh.iconWrap, o.danger && sh.iconDanger]}>
                  <o.Icon size={18} color={o.danger ? Colors.error : Colors.primary} variant="Linear" />
                </View>
                <Text style={[sh.label, o.danger && sh.labelDanger]}>{o.label}</Text>
                <ArrowRight2 size={16} color={Colors.textMuted} variant="Linear" />
              </TouchableOpacity>
            </React.Fragment>
          ))}
          <View style={{ height: 20 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const sh = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#161820',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 10,
    borderTopWidth: 1, borderColor: 'rgba(135,79,225,0.3)',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: `${Colors.primary}20`, alignItems: 'center', justifyContent: 'center' },
  iconDanger: { backgroundColor: `${Colors.error}20` },
  label: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '500' },
  labelDanger: { color: Colors.error },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 20 },
});

const ACTION_ICON_MAP: Record<string, React.ComponentType<any>> = {
  'heart-outline':               Heart,
  'chatbubble-ellipses-outline': Messages3,
  'bookmark-outline':            Bookmark,
  'arrow-redo-outline':          ArrowRotateRight,
};

/* ─── Action button (right sidebar) ─── */
function ActionBtn({ icon, count, onPress }: { icon: string; count?: string; onPress?: () => void }) {
  const AIcon = ACTION_ICON_MAP[icon];
  return (
    <TouchableOpacity style={a.btn} onPress={onPress} activeOpacity={0.75}>
      {AIcon ? <AIcon size={30} color="#fff" variant="Linear" /> : null}
      {count !== undefined && <Text style={a.count}>{count}</Text>}
    </TouchableOpacity>
  );
}

const a = StyleSheet.create({
  btn: { alignItems: 'center', gap: 4 },
  count: {
    color: '#fff', fontSize: 12, fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
});

/* ─── Individual full-screen page ─── */
function VideoPage({
  video, onClose, pageW, pageH, isActive, isMuted, onToggleMute,
}: {
  video: VideoType;
  onClose: () => void;
  pageW: number;
  pageH: number;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { deleteVideo } = useContentStore();
  const [moreVisible, setMoreVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<ExpoVideo>(null);

  const dot = statusColor(video.status);

  // Play/pause based on whether this page is the active one
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.playAsync().catch(() => {});
    } else {
      videoRef.current.pauseAsync().catch(() => {});
      setProgress(0);
    }
  }, [isActive]);

  const handlePlaybackStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setIsLoading(true);
      return;
    }
    setIsLoading(false);
    setIsPlaying(status.isPlaying);
    if (status.durationMillis && status.durationMillis > 0) {
      setDuration(status.durationMillis);
      setProgress(status.positionMillis / status.durationMillis);
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  }, [isPlaying]);

  const goAnalytics = () => {
    onClose();
    setTimeout(() => router.push(`/(app)/content/${video.id}`), 300);
  };
  const copyLink = () => Share.share({ message: video.analytics.referralLink });
  const handleRemove = () => {
    Alert.alert('Remove Content', 'Remove this video?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { deleteVideo(video.id); onClose(); } },
    ]);
  };

  // Format milliseconds → m:ss
  const fmtTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <View style={{ width: pageW, height: pageH, backgroundColor: '#000' }}>

      {/* ── Video player ── */}
      <ExpoVideo
        ref={videoRef}
        source={{ uri: video.videoUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted={isMuted}
        shouldPlay={isActive}
        onPlaybackStatusUpdate={handlePlaybackStatus}
        posterSource={{ uri: video.thumbnailUrl }}
        usePoster={isLoading}
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.15)', 'transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
        locations={[0, 0.25, 0.6, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Tap-to-play/pause overlay */}
      <Pressable style={StyleSheet.absoluteFill} onPress={togglePlayPause}>
        {/* Show spinner while loading */}
        {isLoading && isActive && (
          <View style={p.loadingOverlay}>
            <ActivityIndicator size="large" color="rgba(255,255,255,0.8)" />
          </View>
        )}

        {/* Show play icon briefly when paused (not loading) */}
        {!isPlaying && !isLoading && (
          <View style={p.pausedOverlay}>
            <View style={p.playIconWrap}>
              <Play size={40} color="#fff" variant="Bold" />
            </View>
          </View>
        )}
      </Pressable>

      {/* ── Top bar ── */}
      <View style={[p.topBar, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
        <TouchableOpacity style={p.topBtn} onPress={onClose} activeOpacity={0.8}>
          <ArrowLeft2 size={28} color="#fff" variant="Linear" />
        </TouchableOpacity>

        <View style={p.topRight}>
          {/* Mute toggle */}
          <TouchableOpacity style={p.topBtn} onPress={onToggleMute} activeOpacity={0.8}>
            {isMuted
              ? <VolumeCross size={22} color="#fff" variant="Linear" />
              : <VolumeHigh  size={22} color="#fff" variant="Linear" />
            }
          </TouchableOpacity>
          <TouchableOpacity style={p.topBtn} onPress={() => setMoreVisible(true)} activeOpacity={0.8}>
            <View style={{ transform: [{ rotate: '90deg' }] }}>
              <More size={22} color="#fff" variant="Linear" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Progress bar ── */}
      <View style={p.progressWrap} pointerEvents="none">
        <View style={p.progressTrack}>
          <View style={[p.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        {duration > 0 && (
          <Text style={p.progressTime}>{fmtTime(progress * duration)} / {fmtTime(duration)}</Text>
        )}
      </View>

      {/* ── Bottom section ── */}
      <View style={[p.bottomSection, { paddingBottom: insets.bottom + 16 }]} pointerEvents="box-none">

        {/* Left: status / title / tags / CTA / description */}
        <View style={p.leftContent}>
          <View style={[p.statusBadge, { backgroundColor: dot + '28', borderColor: dot + '55' }]}>
            <View style={[p.statusDot, { backgroundColor: dot }]} />
            <Text style={[p.statusText, { color: dot }]}>{video.status.toUpperCase()}</Text>
          </View>

          <Text style={p.title} numberOfLines={3}>{video.title}</Text>

          {video.tags.length > 0 && (
            <Text style={p.tags} numberOfLines={1}>
              {video.tags.slice(0, 4).map(t => `#${t.label}`).join('  ')}
            </Text>
          )}

          <TouchableOpacity
            style={p.ctaBtn}
            onPress={video.cta ? undefined : goAnalytics}
            activeOpacity={0.85}
          >
            {video.cta
              ? <Calendar1   size={18} color="#fff" variant="Linear" />
              : <ChartSquare size={18} color="#fff" variant="Linear" />
            }
            <Text style={p.ctaText}>{video.cta?.label || 'View Analytics'}</Text>
          </TouchableOpacity>

          {!!video.description && (
            <Text style={p.description} numberOfLines={2}>{video.description}</Text>
          )}
        </View>

        {/* Right sidebar */}
        <View style={p.sidebar}>
          <View style={p.avatarWrap}>
            <Image source={{ uri: video.thumbnailUrl }} style={p.avatar} />
            <View style={p.avatarPlus}>
              <Add size={13} color="#fff" variant="Linear" />
            </View>
          </View>
          <ActionBtn icon="heart-outline"               count={fmt(video.analytics.likes)}    onPress={goAnalytics} />
          <ActionBtn icon="chatbubble-ellipses-outline" count={fmt(video.analytics.comments)} />
          <ActionBtn icon="bookmark-outline"            count={fmt(video.analytics.shares)}   onPress={copyLink} />
          <ActionBtn icon="arrow-redo-outline"          count={fmt(video.analytics.views)}    onPress={copyLink} />
        </View>
      </View>

      <MoreSheet
        visible={moreVisible}
        onClose={() => setMoreVisible(false)}
        onAnalytics={goAnalytics}
        onCopyLink={copyLink}
        onRemove={handleRemove}
      />
    </View>
  );
}

/* ─── Props ─── */
type Props = {
  visible: boolean;
  videos: VideoType[];
  initialIndex: number;
  onClose: () => void;
};

/* ─── Main viewer ─── */
export default function VideoViewer({ visible, videos, initialIndex, onClose }: Props) {
  const flatRef = useRef<FlatList>(null);
  const [pageSize, setPageSize] = useState<{ w: number; h: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);

  // Reset active index whenever the viewer opens
  useEffect(() => {
    if (visible) setActiveIndex(initialIndex);
  }, [visible, initialIndex]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (height > 0) setPageSize({ w: width, h: height });
  }, []);

  const getItemLayout = useCallback((_: any, index: number) => {
    const h = pageSize?.h ?? 0;
    return { length: h, offset: h * index, index };
  }, [pageSize?.h]);

  // Track which page is currently visible
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const toggleMute = useCallback(() => setIsMuted(m => !m), []);

  if (!visible || videos.length === 0) return null;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={{ flex: 1, backgroundColor: '#000' }} onLayout={handleLayout}>
        {pageSize && (
          <FlatList
            ref={flatRef}
            data={videos}
            keyExtractor={v => v.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
            initialScrollIndex={initialIndex}
            getItemLayout={getItemLayout}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            renderItem={({ item, index }) => (
              <VideoPage
                video={item}
                onClose={onClose}
                pageW={pageSize.w}
                pageH={pageSize.h}
                isActive={index === activeIndex}
                isMuted={isMuted}
                onToggleMute={toggleMute}
              />
            )}
          />
        )}
      </View>
    </Modal>
  );
}

/* ─── Page styles ─── */
const p = StyleSheet.create({
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14,
  },
  topBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  topRight: { flexDirection: 'row', gap: 8 },

  // Loading / paused overlays
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  playIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Progress bar
  progressWrap: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    zIndex: 5,
    paddingHorizontal: 14,
    paddingBottom: 6,
    gap: 3,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  progressTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '500',
    alignSelf: 'flex-end',
  },

  bottomSection: {
    position: 'absolute', bottom: 20, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    gap: 12,
  },

  leftContent: { flex: 1, gap: 8 },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },

  title: {
    color: '#fff', fontSize: 21, fontWeight: '800', lineHeight: 27,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },

  tags: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#E06800',
    borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 13,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1 },

  description: { color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 17 },

  sidebar: { alignItems: 'center', gap: 20, paddingBottom: 4 },

  avatarWrap: { alignItems: 'center', marginBottom: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
  avatarPlus: {
    position: 'absolute', bottom: -8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#000',
  },
});
