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

export default function InviteScreen() {
  const router = useRouter();
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

  const handleContinue = () => {
    router.push('/(auth)/setup');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>

        <View style={styles.header}>
          <LinearGradient colors={['#7B4FE9', '#4F35D4']} style={styles.iconCircle}>
            <TicketStar size={26} color="#fff" variant="Linear" />
          </LinearGradient>
          <Text style={styles.title}>Enter Invite Code</Text>
          <Text style={styles.subtitle}>Your invite code links you to your workspace and unlocks your creator account.</Text>
        </View>

        <View style={styles.body}>
          <Input
            label="Invite Code"
            placeholder="e.g. CREATOR2025"
            value={code}
            onChangeText={(t) => { setCode(t); setError(''); setCompanies([]); }}
            autoCapitalize="none"
            error={error}
          />

          <Button title="Validate Code" onPress={handleValidate} loading={loading} />

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
              <Button title="Continue to Profile Setup" onPress={handleContinue} />
            </View>
          )}
        </View>

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
  back: { marginBottom: 28 },
  header: { alignItems: 'center', gap: 12, marginBottom: 36 },
  iconCircle: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  body: { gap: 16 },
  companiesBox: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: Colors.border },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  successText: { color: Colors.text, fontSize: 13, fontWeight: '500' },
  companyChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surfaceElevated, padding: 10, borderRadius: 10 },
  companyName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  companyIndustry: { color: Colors.textSecondary, fontSize: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
