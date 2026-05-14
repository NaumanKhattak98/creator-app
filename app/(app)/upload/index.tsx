import React, { useState, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Image, KeyboardAvoidingView, Platform, TextInput,
  Modal, Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import VideoPreview from '../../../components/VideoPreview';
import { TickSquare, CloseCircle, Add, AddCircle, ArrowLeft2, ArrowDown2, ArrowUp2, CloudAdd, Link2, Lock, Headphone, Sms, Calendar1, Call, DocumentText1, ShoppingCart } from 'iconsax-react-native';

const CTA_ICON_MAP: Record<string, React.ComponentType<any>> = {
  'headset-outline': Headphone,
  'mail-outline': Sms,
  'calendar-outline': Calendar1,
  'call-outline': Call,
  'reader-outline': DocumentText1,
  'cart-outline': ShoppingCart,
};
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { useAuthStore } from '../../../store/authStore';
import { useContentStore } from '../../../store/contentStore';
import CompanySwitcher from '../../../components/CompanySwitcher';
import ScreenBackground from '../../../components/ScreenBackground';
import { PREDEFINED_TAGS, PREDEFINED_CTAS, TAG_CATEGORIES } from '../../../constants/mock';
import { Tag } from '../../../types';

const TAG_COLORS = ['#FBEBBC', '#CCF3F0', '#F8D6E0', '#DCE8FB', '#E8DCFB'];

/* ─── Reusable text field ─── */
function FieldInput({
  value, onChangeText, placeholder, multiline, numberOfLines, returnKeyType, onSubmitEditing,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  returnKeyType?: 'next' | 'done' | 'go';
  onSubmitEditing?: () => void;
}) {
  return (
    <TextInput
      style={[
        fi.input,
        multiline && {
          height: (numberOfLines ?? 4) * 22 + 24,
          textAlignVertical: 'top',
          paddingTop: 10,
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      multiline={multiline}
      numberOfLines={numberOfLines}
      returnKeyType={returnKeyType ?? (multiline ? 'default' : 'next')}
      onSubmitEditing={onSubmitEditing}
      blurOnSubmit={!multiline}
    />
  );
}

const fi = StyleSheet.create({
  input: { color: Colors.text, fontSize: 14, flex: 1, paddingVertical: 10 },
});

/* ─── CTA Picker Sheet ─── */
type CtaOption = typeof PREDEFINED_CTAS[number];

function CTAPickerSheet({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (cta: CtaOption) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={cs.backdrop} onPress={onClose}>
        <Pressable style={[cs.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
          {/* Handle */}
          <View style={cs.handle} />

          {/* Header */}
          <View style={cs.header}>
            <Text style={cs.title}>Select Conversion</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <CloseCircle size={32} color={Colors.text} variant="Bulk" />
            </TouchableOpacity>
          </View>

          <View style={cs.divider} />

          {/* CTA list */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={cs.list}>
            {PREDEFINED_CTAS.map((cta) => (
              <TouchableOpacity
                key={cta.id}
                style={cs.card}
                activeOpacity={0.75}
                onPress={() => { onSelect(cta); onClose(); }}
              >
                {/* Category + name */}
                <Text style={cs.cardCategory}>{cta.ctaCategory}</Text>
                <Text style={cs.cardName}>{cta.name}</Text>

                {/* Button preview */}
                <View style={[cs.previewBtn, { backgroundColor: cta.color }]}>
                  <View style={cs.previewIconWrap}>
                    {(() => { const CI = CTA_ICON_MAP[cta.icon]; return CI ? <CI size={20} color="#fff" variant="Linear" /> : null; })()}
                  </View>
                  <Text style={cs.previewLabel} numberOfLines={1}>{cta.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const cs = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#13141f',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 10,
    borderTopWidth: 1, borderColor: 'rgba(135,79,225,0.25)',
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: 14,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
  },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },

  /* Each CTA card */
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14, padding: 14, gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  cardCategory: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },
  cardName: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },

  /* Preview button inside the card */
  previewBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, overflow: 'hidden',
    height: 48,
  },
  previewIconWrap: {
    width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  previewLabel: {
    flex: 1, color: '#fff', fontSize: 15, fontWeight: '600',
    paddingHorizontal: 12,
  },
});

/* ─── Tag Picker Sheet ─── */
function TagPickerSheet({
  visible,
  onClose,
  initialSelected,
  onConfirm,
  availableTags = PREDEFINED_TAGS,
  title = 'Select Tags',
}: {
  visible: boolean;
  onClose: () => void;
  initialSelected: Tag[];
  onConfirm: (tags: Tag[]) => void;
  availableTags?: Tag[];
  title?: string;
}) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Tag[]>(initialSelected);

  React.useEffect(() => {
    if (visible) setDraft(initialSelected);
  }, [visible]);

  const toggle = (tag: Tag) =>
    setDraft((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag],
    );

  const isSelected = (tag: Tag) => !!draft.find((t) => t.id === tag.id);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={tp.backdrop} onPress={onClose}>
        <Pressable style={[tp.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
          <View style={tp.handle} />

          {/* Header */}
          <View style={tp.header}>
            <Text style={tp.title}>{title}</Text>
            <TouchableOpacity style={tp.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <CloseCircle size={20} color={Colors.text} variant="Bulk" />
            </TouchableOpacity>
          </View>

          <View style={tp.divider} />

          {/* Tag chips */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tp.body}>
            <View style={tp.chipWrap}>
              {availableTags.map((tag, i) => {
                const sel = isSelected(tag);
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      tp.chip,
                      sel
                        ? { backgroundColor: TAG_COLORS[i % TAG_COLORS.length] }
                        : { backgroundColor: Colors.surfaceMedium },
                    ]}
                    onPress={() => toggle(tag)}
                    activeOpacity={0.75}
                  >
                    {sel && <TickSquare size={13} color="rgba(0,0,0,0.5)" variant="Linear" />}
                    <Text style={[tp.chipText, { color: sel ? '#000' : Colors.text }]}>
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Confirm */}
          <View style={tp.footer}>
            <TouchableOpacity
              style={tp.confirmWrapper}
              onPress={() => { onConfirm(draft); onClose(); }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#874FE1', '#100D5B']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={tp.confirmBtn}
              >
                <Text style={tp.confirmText}>
                  Confirm{draft.length > 0 ? ` (${draft.length})` : ''}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const tp = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#13141f',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 10,
    borderTopWidth: 1, borderColor: 'rgba(135,79,225,0.25)',
    maxHeight: '70%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 14,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
  },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceMedium,
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: Colors.border },
  body: { padding: 16 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  footer: { paddingHorizontal: 16, paddingTop: 12 },
  confirmWrapper: { borderRadius: 12, overflow: 'hidden' },
  confirmBtn: { height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

/* ─── Tag Category Picker Sheet ─── */
type TagCategory = typeof TAG_CATEGORIES[number];

function TagCategoryPickerSheet({
  visible,
  onClose,
  initialSelected,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  initialSelected: TagCategory[];
  onConfirm: (categories: TagCategory[]) => void;
}) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<TagCategory[]>(initialSelected);

  React.useEffect(() => {
    if (visible) setDraft(initialSelected);
  }, [visible]);

  const toggle = (cat: TagCategory) =>
    setDraft((prev) =>
      prev.find((c) => c.id === cat.id)
        ? prev.filter((c) => c.id !== cat.id)
        : [...prev, cat],
    );

  const isSelected = (cat: TagCategory) => !!draft.find((c) => c.id === cat.id);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={tc.backdrop} onPress={onClose}>
        <Pressable style={[tc.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
          <View style={tc.handle} />

          {/* Header */}
          <View style={tc.header}>
            <Text style={tc.title}>Select Tag Categories</Text>
            <TouchableOpacity style={tc.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <CloseCircle size={20} color={Colors.text} variant="Bulk" />
            </TouchableOpacity>
          </View>

          <View style={tc.divider} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tc.list}>
            {TAG_CATEGORIES.map((cat) => {
              const sel = isSelected(cat);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[tc.card, sel && { borderColor: cat.color + '60', backgroundColor: cat.color + '10' }]}
                  activeOpacity={0.75}
                  onPress={() => toggle(cat)}
                >
                  {/* Category header row */}
                  <View style={tc.cardHeader}>
                    <View style={[tc.colorDot, { backgroundColor: cat.color }]} />
                    <Text style={tc.cardName}>{cat.name}</Text>
                    {sel && (
                      <View style={[tc.checkBadge, { backgroundColor: cat.color }]}>
                        <TickSquare size={12} color="#fff" variant="Linear" />
                      </View>
                    )}
                  </View>

                  {/* Tag preview chips */}
                  <View style={tc.tagPreviewRow}>
                    {cat.tags.slice(0, 5).map((tag) => (
                      <View key={tag.id} style={[tc.tagPreviewChip, { borderColor: cat.color + '60' }]}>
                        <Text style={[tc.tagPreviewText, { color: cat.color }]}>{tag.label}</Text>
                      </View>
                    ))}
                    {cat.tags.length > 5 && (
                      <Text style={tc.tagPreviewMore}>+{cat.tags.length - 5}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Confirm */}
          <View style={tc.footer}>
            <TouchableOpacity
              style={tc.confirmWrapper}
              onPress={() => { onConfirm(draft); onClose(); }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#874FE1', '#100D5B']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={tc.confirmBtn}
              >
                <Text style={tc.confirmText}>
                  Confirm{draft.length > 0 ? ` (${draft.length})` : ''}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const tc = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#13141f',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 10,
    borderTopWidth: 1, borderColor: 'rgba(135,79,225,0.25)',
    maxHeight: '80%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 14,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14,
  },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceMedium,
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 12 },
  list: { paddingHorizontal: 16, gap: 10, paddingBottom: 8 },

  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  cardSelected: { borderColor: 'rgba(135,79,225,0.4)', backgroundColor: 'rgba(135,79,225,0.08)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  cardName: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '700' },
  checkBadge: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  tagPreviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagPreviewChip: {
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  tagPreviewText: { fontSize: 11, fontWeight: '500' },
  tagPreviewMore: { color: Colors.textMuted, fontSize: 11, alignSelf: 'center' },
  footer: { paddingHorizontal: 16, paddingTop: 12 },
  confirmWrapper: { borderRadius: 12, overflow: 'hidden' },
  confirmBtn: { height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

/* ─── Screen ─── */
export default function UploadScreen() {
  const router = useRouter();
  const { user, switchWorkspace } = useAuthStore();
  const { addVideo } = useContentStore();
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [ctaPickerVisible, setCtaPickerVisible] = useState(false);
  const [catPickerVisible, setCatPickerVisible] = useState(false);
  const [tagPickerVisible, setTagPickerVisible] = useState(false);
  // Which category's tags are being picked (null = none)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [videoUri, setVideoUri] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  // Tag categories: each entry stores the category + which tag IDs are active
  const [categoryEntries, setCategoryEntries] = useState<
    { category: TagCategory; activeTagIds: string[] }[]
  >([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCta, setSelectedCta] = useState<CtaOption | null>(null);
  const [dynamicCtaUrl, setDynamicCtaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setVideoUri(uri);
      try {
        const { uri: frameUri } = await VideoThumbnails.getThumbnailAsync(uri, { time: 0 });
        setThumbnail(frameUri);
      } catch {
        setThumbnail('');
      }
    }
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag],
    );
  };

  // Apply confirmed category selection — preserves per-tag choices for existing entries
  const confirmCategories = (confirmed: TagCategory[]) => {
    setCategoryEntries((prev) =>
      confirmed.map((cat) => {
        const existing = prev.find((e) => e.category.id === cat.id);
        return existing ?? { category: cat, activeTagIds: [] };
      }),
    );
  };

  // Toggle a single tag within an already-added category
  const toggleCategoryTag = (categoryId: string, tagId: string) => {
    setCategoryEntries((prev) =>
      prev.map((e) =>
        e.category.id !== categoryId
          ? e
          : {
              ...e,
              activeTagIds: e.activeTagIds.includes(tagId)
                ? e.activeTagIds.filter((id) => id !== tagId)
                : [...e.activeTagIds, tagId],
            },
      ),
    );
  };

  // Remove an entire category entry
  const removeCategory = (categoryId: string) => {
    setCategoryEntries((prev) => prev.filter((e) => e.category.id !== categoryId));
  };

  const resetForm = () => {
    setVideoUri(''); setTitle(''); setDescription('');
    setSelectedTags([]); setSelectedCta(null); setDynamicCtaUrl('');
    setCategoryEntries([]); setThumbnail(''); setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setUploadProgress(0);
    // Simulate upload progress
    for (let p = 10; p <= 90; p += 10) {
      await new Promise((r) => setTimeout(r, 100));
      setUploadProgress(p);
    }
    addVideo({
      id: `v${Date.now()}`,
      title,
      description,
      thumbnailUrl: thumbnail,
      videoUrl: videoUri || 'https://www.w3schools.com/html/mov_bbb.mp4',
      status: 'pending',
      tags: [
        ...selectedTags,
        ...categoryEntries.flatMap((e) =>
          e.category.tags.filter((t) => e.activeTagIds.includes(t.id)),
        ),
      ],
      cta: selectedCta
        ? {
            id: selectedCta.id,
            type: selectedCta.type,
            label: selectedCta.label,
            url: selectedCta.ctaCategory === 'Dynamic CTA' ? dynamicCtaUrl : selectedCta.url,
          }
        : undefined,
      workspaceId: user?.activeWorkspaceId ?? '',
      createdAt: new Date().toISOString(),
      duration: 60,
      analytics: {
        income: 0, views: 0, likes: 0, comments: 0, shares: 0,
        watchTime: 0, totalTraffic: 0,
        referralLink: `https://creatorportal.io/ref/new`,
        weekly: [], monthly: [], yearly: [],
      },
    });
    setUploadProgress(100);
    await new Promise((r) => setTimeout(r, 200));
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
  };

  const company = user?.workspaces.find((w) => w.id === user.activeWorkspaceId);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />

      {/* Fixed header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft2 size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Short</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, marginTop: 8 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Company row */}
          {user && (
            <>
              <TouchableOpacity
                style={styles.creatorRow}
                onPress={() => setSwitcherVisible(true)}
                activeOpacity={0.75}
              >
                {company?.logo ? (
                  <Image source={{ uri: company.logo }} style={styles.companyRowLogo} />
                ) : (
                  <View style={[styles.companyRowLogo, { backgroundColor: Colors.primary }]} />
                )}
                <Text style={styles.companyRowName}>{company?.name ?? 'Select Company'}</Text>
                <ArrowDown2 size={14} color={Colors.textSecondary} variant="Linear" />
              </TouchableOpacity>
              <CompanySwitcher
                visible={switcherVisible}
                companies={user.workspaces}
                activeCompanyId={user.activeWorkspaceId}
                onSelect={switchWorkspace}
                onClose={() => setSwitcherVisible(false)}
              />
            </>
          )}

          {/* Video picker */}
          <View style={styles.thumbArea}>
            {videoUri ? (
              /* Video auto-plays muted; tap video = mute toggle, tap Replace = re-pick */
              <View style={styles.thumbContainer}>
                <VideoPreview
                  uri={videoUri}
                  poster={thumbnail}
                  style={styles.thumbImage}
                />
                <TouchableOpacity style={styles.replaceOverlay} onPress={pickVideo}>
                  <Text style={styles.replaceText}>Replace</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={pickVideo} style={styles.thumbEmptyContainer}>
                <View style={styles.thumbEmpty}>
                  <CloudAdd size={36} color={Colors.primary} variant="Linear" />
                  <Text style={styles.thumbHint}>Tap to select</Text>
                  <Text style={styles.thumbSub}>Vertical 9:16 · Shorts only</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <View style={styles.inputBox}>
            <FieldInput
              value={title}
              onChangeText={setTitle}
              placeholder="Title of the reel will show here"
              returnKeyType="next"
            />
          </View>

          {/* Description */}
          <View style={[styles.inputBox, styles.inputBoxTall]}>
            <FieldInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description..."
              multiline
              numberOfLines={5}
            />
          </View>

          {/* Advanced Option toggle */}
          <TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => setShowAdvanced(!showAdvanced)}
            activeOpacity={0.7}
          >
            <Text style={styles.advancedLabel}>Advanced Option</Text>
            {showAdvanced
              ? <ArrowUp2 size={16} color={Colors.primary} variant="Linear" />
              : <ArrowDown2 size={16} color={Colors.primary} variant="Linear" />
            }
          </TouchableOpacity>

          {showAdvanced && (
            <View style={styles.advancedBody}>
              {/* ── Free Tags ── */}
              <View>
                <Text style={styles.fieldLabel}>Tags</Text>
                <View style={styles.tagsInputBox}>
                  <View style={styles.tagsRow}>
                    {/* Selected tag chips */}
                    {selectedTags.map((tag, i) => (
                      <TouchableOpacity
                        key={tag.id}
                        style={[styles.tagChip, { backgroundColor: TAG_COLORS[i % TAG_COLORS.length] }]}
                        onPress={() => toggleTag(tag)}
                      >
                        <Text style={styles.tagChipText}>{tag.label}</Text>
                        <CloseCircle size={18} color="rgba(0,0,0,0.4)" variant="Bulk" />
                      </TouchableOpacity>
                    ))}

                    {/* Plus icon to open tag picker */}
                    <TouchableOpacity
                      style={styles.tagAddBtn}
                      onPress={() => setTagPickerVisible(true)}
                      activeOpacity={0.7}
                    >
                      <Add size={20} color="#fff" variant="Linear" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* ── Tag Categories ── */}
              <View style={styles.catSection}>

                {/* Expanded blocks for each confirmed category */}
                {categoryEntries.map(({ category, activeTagIds }) => (
                  <View key={category.id} style={[styles.catBlock, { borderColor: category.color + '50' }]}>
                    {/* Block header: dot + name + remove */}
                    <View style={styles.catBlockHeader}>
                      <View style={[styles.catColorDot, { backgroundColor: category.color }]} />
                      <Text style={styles.catBlockName}>{category.name}</Text>
                      <TouchableOpacity onPress={() => removeCategory(category.id)} activeOpacity={0.7}>
                        <CloseCircle size={20} color={Colors.textMuted} variant="Bulk" />
                      </TouchableOpacity>
                    </View>

                    {/* Selected tags + plus icon to open tag picker for this category */}
                    <View style={styles.tagsRow}>
                      {category.tags
                        .filter((t) => activeTagIds.includes(t.id))
                        .map((tag, i) => (
                          <TouchableOpacity
                            key={tag.id}
                            style={[styles.tagChip, { backgroundColor: TAG_COLORS[i % TAG_COLORS.length] }]}
                            onPress={() => toggleCategoryTag(category.id, tag.id)}
                          >
                            <Text style={styles.tagChipText}>{tag.label}</Text>
                            <CloseCircle size={18} color="rgba(0,0,0,0.4)" variant="Bulk" />
                          </TouchableOpacity>
                        ))}

                      {/* + button to pick tags for this category */}
                      <TouchableOpacity
                        style={styles.tagAddBtn}
                        onPress={() => setEditingCategoryId(category.id)}
                        activeOpacity={0.7}
                      >
                        <Add size={20} color="#fff" variant="Linear" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Text button to add a new tag category */}
                <TouchableOpacity
                  style={styles.addCatBtn}
                  onPress={() => setCatPickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <AddCircle size={16} color={Colors.primary} variant="Linear" />
                  <Text style={styles.addCatBtnText}>Add Tag Category</Text>
                </TouchableOpacity>
              </View>

              {/* ── CTA Dropdown ── */}
              <View style={styles.ctaSection}>
                <Text style={styles.ctaSectionLabel}>Conversion (CTA)</Text>

                {/* Dropdown trigger — shows button preview inside when selected */}
                <TouchableOpacity
                  style={styles.ctaDropdown}
                  onPress={() => setCtaPickerVisible(true)}
                  activeOpacity={0.75}
                >
                  {selectedCta ? (
                    /* Full CTA button preview fills the dropdown */
                    <View style={styles.ctaDropdownInner}>
                      <View style={[styles.ctaPreviewBtn, { backgroundColor: selectedCta.color }]}>
                        <View style={styles.ctaPreviewIconWrap}>
                          {(() => { const CI = CTA_ICON_MAP[selectedCta.icon]; return CI ? <CI size={18} color="#fff" variant="Linear" /> : null; })()}
                        </View>
                        <Text style={styles.ctaPreviewLabel} numberOfLines={1}>
                          {selectedCta.label}
                        </Text>
                      </View>
                      {/* Clear + chevron */}
                      <TouchableOpacity
                        style={styles.ctaClearBtn}
                        onPress={() => { setSelectedCta(null); setDynamicCtaUrl(''); }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <CloseCircle size={16} color={Colors.textMuted} variant="Bulk" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    /* Placeholder row */
                    <>
                      <Text style={styles.ctaDropdownPlaceholder}>Select a CTA…</Text>
                      <ArrowDown2 size={16} color={Colors.textMuted} variant="Linear" />
                    </>
                  )}
                </TouchableOpacity>

                {/* URL field — read-only for Fixed, editable for Dynamic */}
                {selectedCta && (
                  selectedCta.ctaCategory === 'Fixed CTA' ? (
                    /* Fixed: non-editable URL display */
                    <View style={styles.urlBox}>
                      <Link2 size={15} color={Colors.textMuted} variant="Linear" />
                      <Text style={styles.urlFixed} numberOfLines={1}>{selectedCta.url}</Text>
                      <View style={styles.urlLockBadge}>
                        <Lock size={11} color={Colors.textMuted} variant="Linear" />
                      </View>
                    </View>
                  ) : (
                    /* Dynamic: editable URL input */
                    <View style={styles.urlBox}>
                      <Link2 size={15} color={Colors.textMuted} variant="Linear" />
                      <TextInput
                        style={styles.urlInput}
                        value={dynamicCtaUrl}
                        onChangeText={setDynamicCtaUrl}
                        placeholder="https://your-redirect-link.com"
                        placeholderTextColor={Colors.textMuted}
                        autoCapitalize="none"
                        keyboardType="url"
                        returnKeyType="done"
                      />
                    </View>
                  )
                )}
              </View>
            </View>
          )}

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {loading && (
            <View style={styles.progressBarWrap}>
              <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
              <Text style={styles.progressText}>{uploadProgress}%</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={handleUpload}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.uploadWrapper}
          >
            <LinearGradient
              colors={['#874FE1', '#100D5B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.uploadBtn}
            >
              <Text style={styles.uploadBtnText}>{loading ? `Uploading… ${uploadProgress}%` : 'Upload Short'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* CTA Picker Sheet */}
      <CTAPickerSheet
        visible={ctaPickerVisible}
        onClose={() => setCtaPickerVisible(false)}
        onSelect={(cta) => setSelectedCta(cta)}
      />

      {/* Free Tag Picker Sheet */}
      <TagPickerSheet
        visible={tagPickerVisible}
        onClose={() => setTagPickerVisible(false)}
        initialSelected={selectedTags}
        onConfirm={(tags) => setSelectedTags(tags)}
      />

      {/* Per-category Tag Picker Sheet */}
      {editingCategoryId && (() => {
        const entry = categoryEntries.find((e) => e.category.id === editingCategoryId);
        if (!entry) return null;
        const activeTags = entry.category.tags.filter((t) => entry.activeTagIds.includes(t.id));
        return (
          <TagPickerSheet
            visible={!!editingCategoryId}
            onClose={() => setEditingCategoryId(null)}
            availableTags={entry.category.tags}
            initialSelected={activeTags}
            title={`${entry.category.name} Tags`}
            onConfirm={(tags) => {
              setCategoryEntries((prev) =>
                prev.map((e) =>
                  e.category.id === editingCategoryId
                    ? { ...e, activeTagIds: tags.map((t) => t.id) }
                    : e,
                ),
              );
              setEditingCategoryId(null);
            }}
          />
        );
      })()}

      {/* Tag Category Picker Sheet */}
      <TagCategoryPickerSheet
        visible={catPickerVisible}
        onClose={() => setCatPickerVisible(false)}
        initialSelected={categoryEntries.map((e) => e.category)}
        onConfirm={confirmCategories}
      />

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successBackdrop}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <Text style={styles.successEmoji}>🎉</Text>
            </View>
            <Text style={styles.successTitle}>Upload Submitted!</Text>
            <Text style={styles.successSub}>
              Your video is now pending review. We'll notify you once it goes live.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              activeOpacity={0.85}
              onPress={() => {
                setShowSuccess(false);
                resetForm();
                router.push('/(app)/content');
              }}
            >
              <LinearGradient
                colors={['#874FE1', '#100D5B']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.successBtnGradient}
              >
                <Text style={styles.successBtnText}>View My Content</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.successSecondaryBtn}
              onPress={() => { setShowSuccess(false); resetForm(); }}
            >
              <Text style={styles.successSecondaryText}>Upload Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  scroll: { padding: 16, gap: 12 },

  creatorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4,
    backgroundColor: Colors.surfaceMedium,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  companyRowLogo: { width: 28, height: 28, borderRadius: 7 },
  companyRowName: { color: Colors.text, fontSize: 14, fontWeight: '600' },

  thumbArea: { alignItems: 'center' },
  thumbContainer: {
    width: 145, height: 250, borderRadius: 10,
    overflow: 'hidden', backgroundColor: Colors.surfaceElevated,
  },
  thumbEmptyContainer: {
    width: 145, height: 250, borderRadius: 14,
    backgroundColor: `${Colors.primary}12`,
    borderWidth: 1.5, borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  thumbHint: { color: Colors.text, fontSize: 13, fontWeight: '500', textAlign: 'center' },
  thumbSub: { color: Colors.textMuted, fontSize: 11, textAlign: 'center' },
  replaceOverlay: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  replaceText: { color: '#fff', fontSize: 12 },

  inputBox: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 8,
    paddingHorizontal: 12, minHeight: 40, justifyContent: 'center',
  },
  inputBoxTall: { minHeight: 120 },

  advancedToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4,
  },
  advancedLabel: { color: Colors.primary, fontSize: 14, fontWeight: '500' },
  advancedBody: { gap: 12 },

  tagsInputBox: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 10,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 53,
  },
  tagChipText: { color: '#000', fontSize: 13 },
  tagAddBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  fieldLabel: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '600',
    letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6,
  },

  /* Tag Categories */
  catSection: { gap: 10 },
  catBlock: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12, padding: 12, gap: 10,
    borderWidth: 1,
  },
  catBlockHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catColorDot: { width: 10, height: 10, borderRadius: 5 },
  catBlockName: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '700' },

  addCatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingVertical: 4,
  },
  addCatBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },

  /* ── CTA section ── */
  ctaSection: { gap: 10 },
  ctaSectionLabel: {
    color: Colors.textSecondary, fontSize: 12, fontWeight: '600',
    letterSpacing: 0.5, textTransform: 'uppercase',
  },

  /* Dropdown trigger */
  ctaDropdown: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
    minHeight: 50,
    paddingHorizontal: 10, paddingVertical: 8, gap: 8,
  },
  /* Row that holds the preview button + clear icon when CTA is selected */
  ctaDropdownInner: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  ctaDropdownPlaceholder: { flex: 1, color: Colors.textMuted, fontSize: 14, paddingHorizontal: 4 },

  /* Colored CTA button preview (inside dropdown) */
  ctaPreviewBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, overflow: 'hidden', height: 38,
  },
  ctaPreviewIconWrap: {
    width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  ctaPreviewLabel: {
    flex: 1, color: '#fff', fontSize: 13, fontWeight: '600', paddingHorizontal: 8,
  },
  ctaClearBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.surfaceMedium,
    alignItems: 'center', justifyContent: 'center',
  },

  /* URL field (Fixed = display, Dynamic = input) */
  urlBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  urlFixed: {
    flex: 1, color: Colors.textMuted, fontSize: 13,
  },
  urlInput: {
    flex: 1, color: Colors.text, fontSize: 13, paddingVertical: 0,
  },
  urlLockBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.surfaceMedium,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Footer */
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#08080e',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  uploadWrapper: { borderRadius: 12, overflow: 'hidden' },
  uploadBtn: { height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  /* Progress bar */
  progressBarWrap: {
    height: 6, borderRadius: 3, backgroundColor: Colors.surfaceElevated,
    marginBottom: 10, overflow: 'hidden', position: 'relative',
  },
  progressBarFill: {
    height: '100%', borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  progressText: {
    position: 'absolute', right: 0, top: -18,
    color: Colors.primary, fontSize: 11, fontWeight: '600',
  },

  /* Success modal */
  successBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  successCard: {
    width: '100%', backgroundColor: '#13141f',
    borderRadius: 24, padding: 28, alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(135,79,225,0.3)',
  },
  successIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  successEmoji: { fontSize: 36 },
  successTitle: { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  successSub: {
    color: 'rgba(255,255,255,0.6)', fontSize: 14,
    textAlign: 'center', lineHeight: 21,
  },
  successBtn: { width: '100%', borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  successBtnGradient: { height: 48, alignItems: 'center', justifyContent: 'center' },
  successBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  successSecondaryBtn: { paddingVertical: 10 },
  successSecondaryText: { color: Colors.primary, fontSize: 14, fontWeight: '500' },
});
