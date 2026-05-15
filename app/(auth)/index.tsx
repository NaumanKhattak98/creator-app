import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Google, Apple } from 'iconsax-react-native';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogoBrand } from '../../components/LogoBrand';
import ScreenBackground from '../../components/ScreenBackground';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, loginWithApple } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try { await loginWithGoogle(); } finally { setLoading(false); }
  };

  const handleApple = async () => {
    setLoading(true);
    try { await loginWithApple(); } finally { setLoading(false); }
  };

  return (
    <View style={styles.flex}>
      <ScreenBackground />

      {/* Logo header — outside scroll so gradient spans full width */}
      <LinearGradient
        colors={['rgba(75,8,109,0.18)', 'rgba(172,192,255,0.08)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.logoArea}
      >
        <LogoBrand size={52} />
      </LinearGradient>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your account details to login</Text>

          <View style={styles.fields}>
            <Input
              label="Email or Phone number"
              placeholder="Enter your email or phone number"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Login" onPress={handleLogin} loading={loading} />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>or continue with</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={handleGoogle}>
              <Google size={20} color={Colors.text} variant="Linear" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.socialBtn} onPress={handleApple}>
                <Apple size={20} color={Colors.text} variant="Linear" />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/invite')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 0, paddingBottom: 40, gap: 32 },
  logoArea: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 28,
  },
  card: { gap: 16, paddingHorizontal: 24 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '700' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: -8 },
  fields: { gap: 14 },
  error: { color: Colors.error, fontSize: 13, textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: { color: Colors.textSecondary, fontSize: 13 },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surfaceElevated, borderRadius: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  socialText: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, paddingHorizontal: 24 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
