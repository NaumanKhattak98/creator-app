import React from 'react';
import { Tabs, useSegments } from 'expo-router';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Bag2, AddCircle, ProfileCircle } from 'iconsax-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../../store/authStore';

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const segments = useSegments();

  // Hide on the upload tab and on any child/nested screen (depth > 2 means
  // we're past the root of a tab, e.g. profile/settings or content/[id]).
  const isUpload = segments[1] === 'upload';
  const isChildScreen = segments.length > 2;
  if (isUpload || isChildScreen) return null;

  const TAB_CONFIG = [
    { name: 'content', label: 'Content', Icon: Bag2 },
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
        const avatar = isProfile ? user?.profileImage : undefined;
        const { Icon } = tab;

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.tab, { opacity: isFocused ? 1 : 0.4 }]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarIcon} />
            ) : (
              <Icon size={24} color="#fff" variant="Linear" />
            )}
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
