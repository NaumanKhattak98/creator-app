import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VideoStatus } from '../../types';
import { StatusColors } from '../../constants/colors';

interface Props {
  status: VideoStatus;
}

const LABELS: Record<VideoStatus, string> = {
  live: 'Live',
  pending: 'Pending',
  rejected: 'Rejected',
  revise: 'Revise',
};

export function StatusBadge({ status }: Props) {
  const color = StatusColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 12, fontWeight: '600' },
});
