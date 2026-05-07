import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [layoutMounted, setLayoutMounted] = useState(false);

  // First effect: signals the navigator is mounted after the first render
  useEffect(() => {
    setLayoutMounted(true);
  }, []);

  // Second effect: only runs after layoutMounted becomes true (second render cycle)
  // By then the Stack navigator is fully registered and safe to navigate into
  useEffect(() => {
    if (!layoutMounted) return;

    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)');
    } else if (isAuthenticated && inAuth) {
      router.replace('/(app)/content');
    }
  }, [isAuthenticated, segments, layoutMounted]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0D12' } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}
