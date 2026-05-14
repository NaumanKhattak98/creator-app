import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const { isAuthenticated, hasSeenOnboarding } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [layoutMounted, setLayoutMounted] = useState(false);

  useEffect(() => {
    setLayoutMounted(true);
  }, []);

  useEffect(() => {
    if (!layoutMounted) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)');
    } else if (isAuthenticated && !hasSeenOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (isAuthenticated && hasSeenOnboarding && (inAuth || inOnboarding)) {
      router.replace('/(app)/content');
    }
  }, [isAuthenticated, hasSeenOnboarding, segments, layoutMounted]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0D12' } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </>
  );
}
