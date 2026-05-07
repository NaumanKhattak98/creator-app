import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, ShieldTick, Card, Camera, Lock, TickCircle, InfoCircle, TickSquare, Profile } from 'iconsax-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../../constants/colors';
import ScreenBackground from '../../../../components/ScreenBackground';
import { useAuthStore } from '../../../../store/authStore';
import { Button } from '../../../../components/ui/Button';

type KycStep = 'intro' | 'id_front' | 'id_back' | 'selfie' | 'review' | 'done';

const STEPS = ['intro', 'id_front', 'id_back', 'selfie', 'review', 'done'] as KycStep[];

function StepIndicator({ current }: { current: KycStep }) {
  const active = ['id_front', 'id_back', 'selfie', 'review'];
  const idx = active.indexOf(current);
  return (
    <View style={indicator.row}>
      {active.map((s, i) => (
        <React.Fragment key={s}>
          <View style={[indicator.dot, i <= idx && indicator.dotActive]} />
          {i < active.length - 1 && <View style={[indicator.line, i < idx && indicator.lineActive]} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const indicator = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary },
  line: { flex: 1, height: 2, backgroundColor: Colors.border, maxWidth: 60 },
  lineActive: { backgroundColor: Colors.primary },
});

export default function KycScreen() {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [step, setStep] = useState<KycStep>('intro');
  const [idFront, setIdFront] = useState('');
  const [idBack, setIdBack] = useState('');
  const [selfie, setSelfie] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async (setter: (uri: string) => void, camera = false) => {
    const result = camera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    updateUser({ kycCompleted: true });
    setSubmitting(false);
    setStep('done');
  };

  const ImageSlot = ({ uri, onPick, label, icon }: { uri: string; onPick: () => void; label: string; icon: string }) => (
    <TouchableOpacity style={slot.container} onPress={onPick}>
      {uri ? (
        <Image source={{ uri }} style={slot.img} />
      ) : (
        <View style={slot.empty}>
          {icon === 'card-outline' ? <Card size={32} color={Colors.primary} variant="Linear" /> : icon === 'camera-outline' ? <Camera size={32} color={Colors.primary} variant="Linear" /> : <Profile size={32} color={Colors.primary} variant="Linear" />}
          <Text style={slot.label}>{label}</Text>
          <Text style={slot.hint}>Tap to capture or upload</Text>
        </View>
      )}
      {uri && (
        <View style={slot.check}>
          <TickCircle size={24} color={Colors.success} variant="Linear" />
        </View>
      )}
    </TouchableOpacity>
  );

  const slot = StyleSheet.create({
    container: { height: 200, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed', backgroundColor: Colors.surface },
    img: { width: '100%', height: '100%' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    label: { color: Colors.text, fontSize: 15, fontWeight: '600' },
    hint: { color: Colors.textSecondary, fontSize: 12 },
    check: { position: 'absolute', top: 10, right: 10, backgroundColor: Colors.background, borderRadius: 12 },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step === 'intro' ? router.back() : setStep(STEPS[STEPS.indexOf(step) - 1]))}>
          <ArrowLeft size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={{ marginTop: 8 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step !== 'intro' && step !== 'done' && <StepIndicator current={step} />}

        {/* Intro */}
        {step === 'intro' && (
          <View style={styles.centered}>
            <LinearGradient colors={['#7B4FE9', '#4F35D4']} style={styles.kycIcon}>
              <ShieldTick size={36} color="#fff" variant="Linear" />
            </LinearGradient>
            <Text style={styles.title}>Verify Your Identity</Text>
            <Text style={styles.subtitle}>
              Complete KYC to unlock video uploads and get paid. This process takes under 2 minutes.
            </Text>
            <View style={styles.requirementsList}>
              {[
                { Icon: Card,   text: "Government-issued ID (front & back)" },
                { Icon: Camera, text: "A selfie for facial verification" },
                { Icon: Lock,   text: "Your data is encrypted and secure" },
              ].map((r) => (
                <View key={r.text} style={styles.reqRow}>
                  <r.Icon size={18} color={Colors.primary} variant="Linear" />
                  <Text style={styles.reqText}>{r.text}</Text>
                </View>
              ))}
            </View>
            <Button title="Start Verification" onPress={() => setStep('id_front')} style={styles.fullBtn} />
          </View>
        )}

        {/* ID Front */}
        {step === 'id_front' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Front of ID</Text>
            <Text style={styles.stepSubtitle}>Passport, national ID, or driver's licence. Make sure all text is clearly visible.</Text>
            <ImageSlot uri={idFront} onPick={() => pickImage(setIdFront)} label="ID Front" icon="card-outline" />
            <View style={styles.btnRow}>
              <Button title="Use Camera" onPress={() => pickImage(setIdFront, true)} variant="outline" style={styles.halfBtn} />
              <Button title={idFront ? 'Next →' : 'Skip for now'} onPress={() => setStep('id_back')} style={styles.halfBtn} />
            </View>
          </View>
        )}

        {/* ID Back */}
        {step === 'id_back' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Back of ID</Text>
            <Text style={styles.stepSubtitle}>Flip your document and capture the back side.</Text>
            <ImageSlot uri={idBack} onPick={() => pickImage(setIdBack)} label="ID Back" icon="card-outline" />
            <View style={styles.btnRow}>
              <Button title="Use Camera" onPress={() => pickImage(setIdBack, true)} variant="outline" style={styles.halfBtn} />
              <Button title={idBack ? 'Next →' : 'Skip for now'} onPress={() => setStep('selfie')} style={styles.halfBtn} />
            </View>
          </View>
        )}

        {/* Selfie */}
        {step === 'selfie' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Take a Selfie</Text>
            <Text style={styles.stepSubtitle}>Look straight into the camera. No glasses, no hats. Good lighting helps.</Text>
            <ImageSlot uri={selfie} onPick={() => pickImage(setSelfie, true)} label="Selfie" icon="person-outline" />
            <View style={styles.btnRow}>
              <Button title="Upload Photo" onPress={() => pickImage(setSelfie)} variant="outline" style={styles.halfBtn} />
              <Button title={selfie ? 'Next →' : 'Skip for now'} onPress={() => setStep('review')} style={styles.halfBtn} />
            </View>
          </View>
        )}

        {/* Review */}
        {step === 'review' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & Submit</Text>
            <Text style={styles.stepSubtitle}>Check your documents before submitting. You can go back to re-capture any image.</Text>
            <View style={styles.reviewGrid}>
              {[{ label: 'ID Front', uri: idFront }, { label: 'ID Back', uri: idBack }, { label: 'Selfie', uri: selfie }].map((r) => (
                <View key={r.label} style={styles.reviewItem}>
                  {r.uri ? (
                    <Image source={{ uri: r.uri }} style={styles.reviewThumb} />
                  ) : (
                    <View style={styles.reviewMissing}>
                      <InfoCircle size={22} color={Colors.warning} variant="Linear" />
                    </View>
                  )}
                  <Text style={styles.reviewLabel}>{r.label}</Text>
                </View>
              ))}
            </View>
            {submitting ? (
              <View style={styles.submitting}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.submittingText}>Submitting your documents…</Text>
              </View>
            ) : (
              <Button title="Submit for Verification" onPress={handleSubmit} />
            )}
          </View>
        )}

        {/* Done */}
        {step === 'done' && (
          <View style={styles.centered}>
            <View style={styles.successCircle}>
              <TickSquare size={40} color="#fff" variant="Linear" />
            </View>
            <Text style={styles.title}>Verification Submitted!</Text>
            <Text style={styles.subtitle}>Your documents are under review. We'll notify you within 24 hours. You can now upload videos.</Text>
            <Button title="Go to Profile" onPress={() => router.push('/(app)/profile')} style={styles.fullBtn} />
          </View>
        )}
      </ScrollView>
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
  headerTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  scroll: { padding: 24, gap: 24, flexGrow: 1 },
  centered: { flex: 1, alignItems: 'center', gap: 16, paddingTop: 20 },
  kycIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 21, maxWidth: 300 },
  requirementsList: { width: '100%', gap: 12, backgroundColor: Colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reqText: { color: Colors.text, fontSize: 14 },
  fullBtn: { width: '100%', marginTop: 8 },
  stepContent: { gap: 16 },
  stepTitle: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  stepSubtitle: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: 12 },
  halfBtn: { flex: 1 },
  reviewGrid: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  reviewItem: { alignItems: 'center', gap: 6, flex: 1 },
  reviewThumb: { width: '100%', aspectRatio: 1, borderRadius: 10 },
  reviewMissing: { width: '100%', aspectRatio: 1, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  reviewLabel: { color: Colors.textSecondary, fontSize: 12 },
  submitting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  submittingText: { color: Colors.textSecondary, fontSize: 14 },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' },
});
