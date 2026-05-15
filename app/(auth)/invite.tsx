import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Sms, Lock, TicketStar, TickCircle, Briefcase } from 'iconsax-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Workspace } from '../../types';
import ScreenBackground from '../../components/ScreenBackground';
import { LogoBrand } from '../../components/LogoBrand';

/* ─── Step 1: Credentials (matches Figma) ─── */
function CredentialsStep({ onNext }: { onNext: () => void }) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [smsUpdates, setSmsUpdates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuthStore();

  const handleNext = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(email.trim(), password);
      onNext();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s1.container}>
      {/* Title */}
      <View style={s1.titleBlock}>
        <Text style={s1.title}>Welcome</Text>
        <Text style={s1.subtitle}>Become an enterprise creator</Text>
      </View>

      {/* Fields */}
      <View style={s1.fields}>
        {/* Phone number */}
        <View style={s1.fieldGroup}>
          <Text style={s1.label}>Phone number</Text>
          <View style={s1.phoneField}>
            <Text style={s1.flag}>🇺🇸</Text>
            <Text style={s1.countryCode}>+1</Text>
            <TextInput
              style={s1.phoneInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="000 000 0000"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Email */}
        <View style={s1.fieldGroup}>
          <Text style={s1.label}>Email</Text>
          <View style={s1.inputRow}>
            <TextInput
              style={s1.textInput}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              placeholder="Enter your Email address"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Sms size={22} color="rgba(255,255,255,0.4)" variant="Linear" />
          </View>
        </View>

        {/* Password */}
        <View style={s1.fieldGroup}>
          <Text style={s1.label}>Password</Text>
          <View style={s1.inputRow}>
            <TextInput
              style={s1.textInput}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              placeholder="Create password"
              placeholderTextColor="rgba(255,255,255,0.35)"
              secureTextEntry
            />
            <Lock size={22} color="rgba(255,255,255,0.4)" variant="Linear" />
          </View>
        </View>
      </View>

      {error ? <Text style={s1.error}>{error}</Text> : null}

      {/* Checkbox */}
      <TouchableOpacity
        style={s1.checkboxRow}
        onPress={() => setSmsUpdates(v => !v)}
        activeOpacity={0.7}
      >
        <View style={[s1.checkbox, smsUpdates && s1.checkboxActive]}>
          {smsUpdates && <Text style={s1.checkMark}>✓</Text>}
        </View>
        <Text style={s1.checkboxLabel}>Receive text updates from creator concierge</Text>
      </TouchableOpacity>

      {/* T&C */}
      <Text style={s1.terms}>
        <Text style={s1.termsGray}>by continuing you agree with app's </Text>
        <Text style={s1.termsLink}>T&C</Text>
        <Text style={s1.termsGray}> and </Text>
        <Text style={s1.termsLink}>Privacy Policy</Text>
      </Text>

      {/* Next button */}
      <TouchableOpacity
        style={s1.btnWrap}
        onPress={handleNext}
        disabled={loading}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={['#874FE1', '#100D5B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s1.btn}
        >
          <Text style={s1.btnText}>{loading ? 'Please wait…' : 'Next'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const s1 = StyleSheet.create({
  container: { gap: 20 },
  titleBlock: { gap: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },

  fields: { gap: 16 },
  fieldGroup: { gap: 4 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },

  /* Phone */
  phoneField: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8, paddingHorizontal: 12, height: 48,
  },
  flag: { fontSize: 18 },
  countryCode: { color: '#fff', fontSize: 14, fontWeight: '500' },
  phoneInput: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 0 },

  /* Email / Password */
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8, paddingHorizontal: 12, height: 48, gap: 8,
  },
  textInput: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 0 },

  error: { color: Colors.error, fontSize: 13, textAlign: 'center', marginTop: -8 },

  /* Checkbox */
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  checkboxLabel: { flex: 1, color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 20 },

  /* T&C */
  terms: { textAlign: 'center', fontSize: 14, lineHeight: 22 },
  termsGray: { color: 'rgba(255,255,255,0.6)' },
  termsLink: { color: Colors.primary, fontWeight: '500' },

  /* Button */
  btnWrap: { borderRadius: 12, overflow: 'hidden' },
  btn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

/* ─── Step 2: Invite Code (optional) ─── */
function InviteCodeStep({ onSkip, onContinue }: { onSkip: () => void; onContinue: () => void }) {
  const { validateInvite } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const handleValidate = async () => {
    if (!code.trim()) { setError('Please enter your invite code.'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await validateInvite(code.trim());
      setWorkspaces(result);
    } catch {
      setError('Invalid invite code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.body}>
      <View style={styles.header}>
        <LinearGradient colors={['#7B4FE9', '#4F35D4']} style={styles.iconCircle}>
          <TicketStar size={26} color="#fff" variant="Linear" />
        </LinearGradient>
        <Text style={styles.title}>Invite Code</Text>
        <Text style={styles.subtitle}>
          Have an invite code? Enter it to link your account to a workspace. You can also skip this step.
        </Text>
      </View>

      <Input
        label="Invite Code (Optional)"
        placeholder="e.g. CREATOR2025"
        value={code}
        onChangeText={(t) => { setCode(t); setError(''); setWorkspaces([]); }}
        autoCapitalize="characters"
        error={error}
      />

      {workspaces.length === 0 && (
        <Button title="Validate Code" onPress={handleValidate} loading={loading} />
      )}

      {workspaces.length > 0 && (
        <View style={styles.companiesBox}>
          <View style={styles.successRow}>
            <TickCircle size={18} color={Colors.success} variant="Linear" />
            <Text style={styles.successText}>Code validated! You'll be attached to:</Text>
          </View>
          {workspaces.map((w) => (
            <View key={w.id} style={styles.companyChip}>
              <Briefcase size={14} color={Colors.primary} variant="Linear" />
              <Text style={styles.companyName}>{w.name}</Text>
              <Text style={styles.companyIndustry}>· {w.workspaceType}</Text>
            </View>
          ))}
          <Button title="Continue to Profile Setup" onPress={onContinue} />
        </View>
      )}

      <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─── Main Screen ─── */
export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2>(1);

  const goToSetup = () => router.push('/(auth)/setup');

  return (
    <View style={styles.flex}>
      <ScreenBackground />

      {/* Logo header */}
      <LinearGradient
        colors={['rgba(75,8,109,0.10)', 'rgba(172,192,255,0.10)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.logoArea, { paddingTop: insets.top + 48 }]}
      >
        <LogoBrand size={52} />
      </LinearGradient>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {step === 1 ? (
            <>
              <CredentialsStep onNext={() => setStep(2)} />
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)')}>
                  <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
              <InviteCodeStep onSkip={goToSetup} onContinue={goToSetup} />
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)')}>
                  <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  /* Logo header */
  logoArea: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 48,
  },
  scroll: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40, gap: 24 },
  backBtn: { marginBottom: 4 },
  backText: { color: Colors.primary, fontSize: 14, fontWeight: '500' },

  /* Invite step shared */
  body: { gap: 16 },
  header: { alignItems: 'center', gap: 12, marginBottom: 8 },
  iconCircle: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  companiesBox: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: Colors.border },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  successText: { color: Colors.text, fontSize: 13, fontWeight: '500' },
  companyChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surfaceElevated, padding: 10, borderRadius: 10 },
  companyName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  companyIndustry: { color: Colors.textSecondary, fontSize: 12 },
  skipBtn: { alignItems: 'center', paddingVertical: 6 },
  skipText: { color: Colors.textSecondary, fontSize: 14 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
