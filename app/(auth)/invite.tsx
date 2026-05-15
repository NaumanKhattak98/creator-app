import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, TicketStar, TickCircle, Briefcase } from 'iconsax-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Workspace } from '../../types';

/* ─── Step 1: Credentials ─── */
function CredentialsStep({
  onNext,
}: {
  onNext: (email: string, password: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuthStore();

  const handleNext = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
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
      onNext(email.trim(), password);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.body}>
      <View style={styles.header}>
        <LinearGradient colors={['#7B4FE9', '#4F35D4']} style={styles.iconCircle}>
          <Text style={{ fontSize: 26 }}>👤</Text>
        </LinearGradient>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Enter your details to get started</Text>
      </View>

      <View style={styles.fields}>
        <Input
          label="Email or Phone Number"
          placeholder="Enter your email or phone number"
          value={email}
          onChangeText={(t) => { setEmail(t); setError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={(t) => { setPassword(t); setError(''); }}
          secureTextEntry
        />
        <Input
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirm}
          onChangeText={(t) => { setConfirm(t); setError(''); }}
          secureTextEntry
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Next" onPress={handleNext} loading={loading} />
    </View>
  );
}

/* ─── Step 2: Invite Code (optional) ─── */
function InviteCodeStep({
  onSkip,
  onContinue,
}: {
  onSkip: () => void;
  onContinue: () => void;
}) {
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

      {/* Skip option */}
      <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─── Main Screen ─── */
export default function SignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const handleCredentialsDone = (email: string, password: string) => {
    setStep(2);
  };

  const goToSetup = () => {
    router.push('/(auth)/setup');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Back button */}
        <TouchableOpacity
          style={styles.back}
          onPress={() => {
            if (step === 2) setStep(1);
            else router.back();
          }}
        >
          <ArrowLeft size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        </View>

        {step === 1 ? (
          <CredentialsStep onNext={handleCredentialsDone} />
        ) : (
          <InviteCodeStep onSkip={goToSetup} onContinue={goToSetup} />
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)')}>
            <Text style={styles.footerLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: 20 },

  /* Step indicator */
  stepRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 28, alignSelf: 'flex-start', gap: 0,
  },
  stepDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepLine: {
    width: 32, height: 2,
    backgroundColor: Colors.border,
  },

  /* Shared */
  body: { gap: 16 },
  header: { alignItems: 'center', gap: 12, marginBottom: 8 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  subtitle: {
    color: Colors.textSecondary, fontSize: 14,
    textAlign: 'center', lineHeight: 20,
  },
  fields: { gap: 14 },
  error: { color: Colors.error, fontSize: 13, textAlign: 'center' },

  /* Invite code results */
  companiesBox: {
    backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  successText: { color: Colors.text, fontSize: 13, fontWeight: '500' },
  companyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceElevated,
    padding: 10, borderRadius: 10,
  },
  companyName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  companyIndustry: { color: Colors.textSecondary, fontSize: 12 },

  /* Skip */
  skipBtn: { alignItems: 'center', paddingVertical: 6 },
  skipText: { color: Colors.textSecondary, fontSize: 14 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 36 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
