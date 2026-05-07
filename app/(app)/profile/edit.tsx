import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft2, Gallery, Camera, Profile } from 'iconsax-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../../constants/colors';
import { useAuthStore } from '../../../store/authStore';
import ScreenBackground from '../../../components/ScreenBackground';

/* ─── Reusable labelled field ─── */
function Field({
  label, value, onChangeText, placeholder, multiline, numberOfLines,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
}) {
  return (
    <View style={field.wrap}>
      <Text style={field.label}>{label}</Text>
      <TextInput
        style={[
          field.input,
          multiline && {
            height: (numberOfLines ?? 4) * 22 + 20,
            textAlignVertical: 'top',
            paddingTop: 12,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        numberOfLines={numberOfLines}
        returnKeyType={multiline ? 'default' : 'next'}
        blurOnSubmit={!multiline}
      />
    </View>
  );
}

const field = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
});

/* ─── Screen ─── */
export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? '');
  const [bannerImage, setBannerImage] = useState(user?.bannerImage ?? '');
  const [saving, setSaving] = useState(false);

  const pickImage = async (setter: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600)); // simulate save
    updateUser({ name, username, bio, profileImage, bannerImage });
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft2 size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ marginTop: 8 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Banner picker */}
          <TouchableOpacity onPress={() => pickImage(setBannerImage)} activeOpacity={0.8}>
            <View style={styles.bannerWrap}>
              {bannerImage ? (
                <Image source={{ uri: bannerImage }} style={styles.banner} resizeMode="cover" />
              ) : (
                <View style={styles.bannerEmpty}>
                  <Gallery size={28} color={Colors.textMuted} variant="Linear" />
                  <Text style={styles.bannerEmptyText}>Tap to change banner</Text>
                </View>
              )}
              <View style={styles.bannerEditBadge}>
                <Camera size={14} color="#fff" variant="Linear" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Avatar picker — overlapping the banner */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={() => pickImage(setProfileImage)}
              activeOpacity={0.8}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarEmpty]}>
                  <Profile size={32} color={Colors.textMuted} variant="Linear" />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Camera size={12} color="#fff" variant="Linear" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Fields */}
          <View style={styles.fields}>
            <Field
              label="Display Name"
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
            />
            <Field
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="@handle"
            />
            <Field
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell brands and followers about yourself…"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Save button — inside KAV so it lifts above keyboard */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={styles.saveWrapper}
          >
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
      </KeyboardAvoidingView>
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

  scroll: { paddingBottom: 16 },

  /* Banner */
  bannerWrap: {
    height: 130,
    backgroundColor: Colors.surfaceElevated,
    position: 'relative',
  },
  banner: { width: '100%', height: '100%' },
  bannerEmpty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  bannerEmptyText: { color: Colors.textMuted, fontSize: 13 },
  bannerEditBadge: {
    position: 'absolute', bottom: 10, right: 10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Avatar */
  avatarSection: {
    paddingHorizontal: 16,
    marginTop: -36,
    marginBottom: 8,
  },
  avatarWrap: { position: 'relative', alignSelf: 'flex-start' },
  avatar: {
    width: 80, height: 80, borderRadius: 14,
    borderWidth: 3, borderColor: '#08080e',
    backgroundColor: Colors.surface,
  },
  avatarEmpty: { alignItems: 'center', justifyContent: 'center' },
  avatarEditBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#08080e',
  },

  /* Fields */
  fields: { paddingHorizontal: 16, gap: 18, marginTop: 10 },

  /* Footer */
  footer: {
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12,
    backgroundColor: '#08080e',
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  saveWrapper: { borderRadius: 12, overflow: 'hidden' },
  saveBtn: { height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
