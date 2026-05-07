import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft2, ArrowUp2, ArrowDown2, CloseCircle, Add, Headphone, Link2, DocumentText1 } from 'iconsax-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../../constants/colors';
import { useContentStore } from '../../../../store/contentStore';
import { useAuthStore } from '../../../../store/authStore';
import { Input } from '../../../../components/ui/Input';
import { PREDEFINED_TAGS, PREDEFINED_CTA_TYPES } from '../../../../constants/mock';
import { Tag } from '../../../../types';

const TAG_COLORS = ['#FBEBBC', '#CCF3F0', '#F8D6E0', '#DCE8FB', '#E8DCFB'];

export default function EditVideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { videos, updateVideo } = useContentStore();
  const { user } = useAuthStore();
  const video = videos.find((v) => v.id === id);

  const [thumbnail, setThumbnail] = useState(video?.thumbnailUrl ?? '');
  const [title, setTitle] = useState(video?.title ?? '');
  const [description, setDescription] = useState(video?.description ?? '');
  const [selectedTags, setSelectedTags] = useState<Tag[]>(video?.tags ?? []);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [ctaType, setCtaType] = useState(video?.cta?.type ?? '');
  const [ctaLabel, setCtaLabel] = useState(video?.cta?.label ?? '');
  const [ctaUrl, setCtaUrl] = useState(video?.cta?.url ?? '');
  const [saving, setSaving] = useState(false);

  if (!video) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: Colors.textSecondary }}>Video not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const replaceThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });
    if (!result.canceled) setThumbnail(result.assets[0].uri);
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Title required', 'Please enter a title.'); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    updateVideo(id, {
      title,
      description,
      thumbnailUrl: thumbnail,
      tags: selectedTags,
      cta: ctaType ? { id: video.cta?.id ?? `cta${Date.now()}`, type: ctaType as 'redirect' | 'file', label: ctaLabel, url: ctaUrl } : undefined,
    });
    setSaving(false);
    Alert.alert('Saved!', 'Your changes have been saved.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft2 size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Content</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ marginTop: 8 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Creator Row */}
        <View style={styles.creatorRow}>
          <Image
            source={{ uri: user?.profileImage }}
            style={styles.creatorAvatar}
          />
          <Text style={styles.creatorName}>{user?.name}</Text>
        </View>

        {/* Thumbnail */}
        <View style={styles.thumbArea}>
          <TouchableOpacity onPress={replaceThumbnail} style={styles.thumbContainer}>
            <Image source={{ uri: thumbnail }} style={styles.thumbImage} resizeMode="cover" />
            <View style={styles.replaceOverlay}>
              <Text style={styles.replaceText}>Replace</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.inputBox}>
          <TextInputField
            value={title}
            onChangeText={setTitle}
            placeholder="Title of the reel will show here"
          />
        </View>

        {/* Description */}
        <View style={[styles.inputBox, styles.inputBoxTall]}>
          <TextInputField
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description..."
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Advanced Option toggle */}
        <TouchableOpacity style={styles.advancedToggle} onPress={() => setShowAdvanced(!showAdvanced)}>
          <Text style={styles.advancedLabel}>Advanced Option</Text>
          {showAdvanced
            ? <ArrowUp2 size={16} color={Colors.primary} variant="Linear" />
            : <ArrowDown2 size={16} color={Colors.primary} variant="Linear" />
          }
        </TouchableOpacity>

        {showAdvanced && (
          <View style={styles.advancedBody}>
            {/* Tags row */}
            <View style={styles.tagsInputBox}>
              <View style={styles.tagsRow}>
                {selectedTags.map((tag, i) => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[styles.tagChip, { backgroundColor: TAG_COLORS[i % TAG_COLORS.length] }]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text style={styles.tagChipText}>{tag.label}</Text>
                    <CloseCircle size={18} color="rgba(0,0,0,0.4)" variant="Linear" />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addTagBtn}
                  onPress={() => {
                    // Show remaining tags
                    const remaining = PREDEFINED_TAGS.filter(t => !selectedTags.find(s => s.id === t.id));
                    if (remaining.length === 0) return;
                    const tag = remaining[0];
                    toggleTag(tag);
                  }}
                >
                  <Add size={18} color={Colors.text} variant="Linear" />
                </TouchableOpacity>
              </View>
            </View>

            {/* CTA section */}
            <View style={styles.ctaSection}>
              {ctaType ? (
                <View style={styles.ctaActiveRow}>
                  <TouchableOpacity
                    style={[styles.ctaActiveBtn, { backgroundColor: '#05A41E' }]}
                  >
                    <Headphone size={18} color="#fff" variant="Linear" />
                    <Text style={styles.ctaActiveBtnText}>{ctaLabel || 'CTA Button'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setCtaType(''); setCtaLabel(''); setCtaUrl(''); }}>
                    <CloseCircle size={24} color={Colors.error} variant="Linear" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.ctaTypeRow}>
                  {PREDEFINED_CTA_TYPES.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.ctaTypeBtn, ctaType === c.id && styles.ctaTypeBtnActive]}
                      onPress={() => setCtaType(c.id)}
                    >
                      {c.id === 'redirect'
                        ? <Link2 size={14} color={ctaType === c.id ? '#fff' : Colors.textSecondary} variant="Linear" />
                        : <DocumentText1 size={14} color={ctaType === c.id ? '#fff' : Colors.textSecondary} variant="Linear" />
                      }
                      <Text style={[styles.ctaTypeBtnText, ctaType === c.id && { color: '#fff' }]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {ctaType && (
                <>
                  <View style={styles.inputBox}>
                    <TextInputField
                      value={ctaLabel}
                      onChangeText={setCtaLabel}
                      placeholder="CTA button label"
                    />
                  </View>
                  <View style={styles.inputBox}>
                    <TextInputField
                      value={ctaUrl}
                      onChangeText={setCtaUrl}
                      placeholder="https://www.example.com/..."
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85} style={styles.saveWrapper}>
          <LinearGradient
            colors={['#874FE1', '#100D5B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtn}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function TextInputField({
  value, onChangeText, placeholder, multiline, numberOfLines,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}) {
  const { TextInput } = require('react-native');
  return (
    <TextInput
      style={[
        tf.input,
        multiline && { height: (numberOfLines ?? 4) * 22 + 24, textAlignVertical: 'top', paddingTop: 10 },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
  );
}

const tf = StyleSheet.create({
  input: { color: Colors.text, fontSize: 14, flex: 1, paddingVertical: 10 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 100, gap: 12 },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  creatorAvatar: { width: 32, height: 32, borderRadius: 4 },
  creatorName: { color: Colors.text, fontSize: 14 },
  thumbArea: { alignItems: 'center' },
  thumbContainer: { width: 145, height: 250, borderRadius: 10, overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  replaceOverlay: {
    position: 'absolute', bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  replaceText: { color: '#fff', fontSize: 12 },
  inputBox: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8, paddingHorizontal: 12, minHeight: 40,
    justifyContent: 'center',
  },
  inputBoxTall: { minHeight: 120 },
  advancedToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  advancedLabel: { color: Colors.primary, fontSize: 14, fontWeight: '500' },
  advancedBody: { gap: 10 },
  tagsInputBox: {
    backgroundColor: Colors.surfaceElevated, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8, minHeight: 40,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  tagChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 53,
  },
  tagChipText: { color: '#000', fontSize: 13 },
  addTagBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.surfaceMedium,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaSection: { gap: 8 },
  ctaActiveRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceElevated, borderRadius: 8, padding: 8,
  },
  ctaActiveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
  },
  ctaActiveBtnText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  ctaTypeRow: { flexDirection: 'row', gap: 10 },
  ctaTypeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 10, borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  ctaTypeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  ctaTypeBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 24, backgroundColor: Colors.background },
  saveWrapper: { borderRadius: 12, overflow: 'hidden' },
  saveBtn: { height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
