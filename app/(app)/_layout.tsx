import React, { useEffect, useRef } from 'react';
import { Tabs, useSegments } from 'expo-router';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { VideoPlay, AddCircle, ProfileCircle } from 'iconsax-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../../store/authStore';

/* Notification badge count — mock value, swap for real store later */
const NOTIFICATION_COUNT = 3;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const segments = useSegments();

  // Pulse animation for upload tab
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Hide on the upload tab and on any child/nested screen (depth > 2 means
  // we're past the root of a tab, e.g. profile/settings or content/[id]).
  const isUpload = segments[1] === 'upload';
  const isChildScreen = segments.length > 2;
  if (isUpload || isChildScreen) return null;

  const TAB_CONFIG = [
    { name: 'content', label: 'Content', Icon: VideoPlay },
    { name: 'upload',  label: 'Upload',  Icon: AddCircle },
    { name: 'profile', label: 'Profile', Icon: ProfileCircle },
  ];

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tab = TAB_CONFIG[index];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const isProfile = tab.name === 'profile';
        const isUploadTab = tab.name === 'upload';
        const avatar = isProfile ? user?.profileImage : undefined;
        const { Icon } = tab;

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.tab, { opacity: isFocused ? 1 : 0.4 }, index === 1 && styles.tabMiddle]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <View>
              {isUploadTab ? (
                <Animated.View style={{ transform: [{ scale: pulse }] }}>
                  <Icon size={24} color="#fff" variant="Linear" />
                </Animated.View>
              ) : avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarIcon} />
              ) : (
                <Icon size={24} color="#fff" variant="Linear" />
              )}
              {isProfile && NOTIFICATION_COUNT > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {NOTIFICATION_COUNT > 9 ? '9+' : NOTIFICATION_COUNT}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.label}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#0B0B0B',
    paddingTop: 8,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    shadowColor: 'transparent',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  tabMiddle: {
    marginHorizontal: 8,
  },
  label: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  avatarIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  badge: {
    position: 'absolute', top: -4, right: -6,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#F20000',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5, borderColor: '#0B0B0B',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="content" />
      <Tabs.Screen name="upload" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
