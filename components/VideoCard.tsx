import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Eye, Heart, Money, Edit2, CloudAdd, Trash } from 'iconsax-react-native';
import { useRouter } from 'expo-router';
import { Video } from '../types';
import { Colors } from '../constants/colors';
import { StatusBadge } from './ui/Badge';
import { useContentStore } from '../store/contentStore';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

interface Props {
  video: Video;
}

export function VideoCard({ video }: Props) {
  const router = useRouter();
  const { deleteVideo } = useContentStore();

  const handleDelete = () => {
    Alert.alert('Delete Video', 'Are you sure you want to delete this video?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteVideo(video.id) },
    ]);
  };

  const handleEdit = () => router.push(`/(app)/content/${video.id}?mode=edit`);

  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(app)/content/${video.id}`)}>
      <View style={styles.thumbnail}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.thumb} resizeMode="cover" />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
        </View>
        <View style={styles.statusOverlay}>
          <StatusBadge status={video.status} />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.date}>{new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Eye size={13} color={Colors.textSecondary} variant="Linear" />
            <Text style={styles.statText}>{formatNumber(video.analytics.views)}</Text>
          </View>
          <View style={styles.stat}>
            <Heart size={13} color={Colors.textSecondary} variant="Linear" />
            <Text style={styles.statText}>{formatNumber(video.analytics.likes)}</Text>
          </View>
          <View style={styles.stat}>
            <Money size={13} color={Colors.textSecondary} variant="Linear" />
            <Text style={styles.statText}>${video.analytics.income}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
            <Edit2 size={16} color={Colors.primary} variant="Linear" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          {video.status === 'rejected' && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
              <CloudAdd size={16} color={Colors.warning} variant="Linear" />
              <Text style={[styles.actionText, { color: Colors.warning }]}>Re-upload</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
            <Trash size={16} color={Colors.error} variant="Linear" />
            <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbnail: { height: 200, position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  statusOverlay: { position: 'absolute', top: 8, left: 8 },
  info: { padding: 14, gap: 6 },
  title: { color: Colors.text, fontSize: 15, fontWeight: '600', lineHeight: 20 },
  date: { color: Colors.textMuted, fontSize: 12 },
  stats: { flexDirection: 'row', gap: 14, marginTop: 2 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { color: Colors.textSecondary, fontSize: 12 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { color: Colors.primary, fontSize: 13, fontWeight: '500' },
});
