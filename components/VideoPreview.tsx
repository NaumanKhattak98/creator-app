import React, { useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { VolumeHigh, VolumeCross } from 'iconsax-react-native';

interface Props {
  uri: string;
  /** Poster shown while the video loads (usually the first-frame thumbnail) */
  poster?: string;
  style?: object;
}

/**
 * Autoplays a video muted. Tap anywhere to toggle mute/unmute.
 * Drop-in replacement for <Image> in upload / edit / analytics previews.
 */
export default function VideoPreview({ uri, poster, style }: Props) {
  const videoRef = useRef<ExpoVideo>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = useCallback(() => setIsMuted(m => !m), []);

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

      {/* Mute badge — bottom-right corner */}
      <View style={styles.badge}>
        {isMuted
          ? <VolumeCross size={14} color="#fff" variant="Bold" />
          : <VolumeHigh  size={14} color="#fff" variant="Bold" />
        }
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    padding: 5,
  },
});
