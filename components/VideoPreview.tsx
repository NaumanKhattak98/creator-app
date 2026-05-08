import React, { useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { VolumeHigh, VolumeCross } from 'iconsax-react-native';

interface Props {
  uri: string;
  /** Poster shown while the video loads (usually the first-frame thumbnail) */
  poster?: string;
  style?: object;
}

/**
 * Autoplays a video muted by default.
 * Tap to toggle mute/unmute — shows a centered icon that fades out.
 */
export default function VideoPreview({ uri, poster, style }: Props) {
  const videoRef = useRef<ExpoVideo>(null);
  const [isMuted, setIsMuted] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animRef  = useRef<Animated.CompositeAnimation | null>(null);

  const toggleMute = useCallback(() => {
    setIsMuted(m => {
      // Cancel any in-progress animation then flash the new icon
      animRef.current?.stop();
      fadeAnim.setValue(1);
      animRef.current = Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 700,
        delay: 400,
        useNativeDriver: true,
      });
      animRef.current.start();
      return !m;
    });
  }, [fadeAnim]);

  return (
    <TouchableOpacity activeOpacity={1} onPress={toggleMute} style={[styles.wrap, style]}>
      <ExpoVideo
        ref={videoRef}
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted={isMuted}
        posterSource={poster ? { uri: poster } : undefined}
        usePoster={!!poster}
      />

      {/* Centered icon — flashes on tap then fades out */}
      <Animated.View style={[styles.iconOverlay, { opacity: fadeAnim }]}>
        <View style={styles.iconWrap}>
          {isMuted
            ? <VolumeCross size={28} color="#fff" variant="Bold" />
            : <VolumeHigh  size={28} color="#fff" variant="Bold" />
          }
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  iconOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
