import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Gallery, Profile, Camera } from 'iconsax-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogoBrand } from '../../components/LogoBrand';
import ScreenBackground from '../../components/ScreenBackground';

export default function SetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setupProfile } = useAuthStore();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickImage = async (type: 'profile' | 'banner') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [3, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      if (type === 'profile') setProfileImage(result.assets[0].uri);
      else setBannerImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !username.trim()) { setError('Name and username are required.'); return; }
    setError('');
    setLoading(true);
    try {
      await setupProfile({
        name,
        username: username.startsWith('@') ? username : `@${username}`,
        bio,
        profileImage: profileImage || 'https://picsum.photos/seed/newuser/200',
        bannerImage: bannerImage || 'https://picsum.photos/seed/banner/800/300',
      });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScreenBackground />

      {/* Logo header — outside scroll, respects status-bar / notch */}
      <LinearGradient
        colors={['rgba(75,8,109,0.10)', 'rgba(172,192,255,0.10)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.logoArea, { paddingTop: insets.top + 12 }]}
      >
        <LogoBrand size={52} />
      </LinearGradient>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.text} variant="Linear" />
          </TouchableOpacity>

          <Text style={styles.title}>Set Up Your Profile</Text>
          <Text style={styles.subtitle}>This is how brands and your audience will see you.</Text>

        {/* Banner */}
        <TouchableOpacity style={styles.bannerPicker} onPress={() => pickImage('banner')}>
          {bannerImage ? (
            <Image source={{ uri: bannerImage }} style={styles.banner} />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Gallery size={28} color={Colors.textMuted} variant="Linear" />
              <Text style={styles.pickerHint}>Tap to add banner</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Image */}
        <View style={styles.profileRow}>
          <TouchableOpacity style={styles.profilePicker} onPress={() => pickImage('profile')}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImg} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Profile size={28} color={Colors.textMuted} variant="Linear" />
              </View>
            )}
            <View style={styles.editBadge}>
              <Camera size={12} color="#fff" variant="Linear" />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileHint}>Profile photo</Text>
        </View>

        <View style={styles.fields}>
          <Input label="Full Name" placeholder="Your full name" value={name} onChangeText={setName} />
          <Input
            label="Username"
            placeholder="@username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Input
            label="Bio"
            placeholder="Tell brands and followers about yourself..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Create Profile" onPress={handleSubmit} loading={loading} style={styles.btn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  logoArea: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 48,
  },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 0, paddingBottom: 40, gap: 20 },
  back: { marginBottom: 8 },
  title: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: -12 },
  bannerPicker: { height: 120, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed' },
  banner: { width: '100%', height: '100%' },
  bannerPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  pickerHint: { color: Colors.textMuted, fontSize: 13 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: -12 },
  profilePicker: { width: 80, height: 80, borderRadius: 40, overflow: 'visible' },
  profileImg: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: Colors.background },
  profilePlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.border,
  },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  profileHint: { color: Colors.textSecondary, fontSize: 13 },
  fields: { gap: 14 },
  error: { color: Colors.error, fontSize: 13, textAlign: 'center' },
  btn: { marginTop: 4 },
});
