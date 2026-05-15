import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Enterprise Creator logo — horizontal layout.
 * Replicates the interlocked gradient loops mark shown in the brand image.
 */
export function LogoBrand({ size = 52 }: { size?: number }) {
  const c = size * 0.6;          // individual circle diameter
  const b = Math.max(2, size * 0.072); // border width
  const offset = size * 0.28;    // how much circles overlap / shift

  return (
    <View style={styles.row}>
      {/* ── Icon ── */}
      <View style={{ width: size, height: size }}>
        {/* Top-left loop – blue */}
        <View style={[styles.loop, {
          width: c, height: c, borderRadius: c / 2, borderWidth: b,
          borderColor: '#4BA8FF',
          top: 0, left: 0,
        }]} />
        {/* Top-right loop – indigo */}
        <View style={[styles.loop, {
          width: c, height: c, borderRadius: c / 2, borderWidth: b,
          borderColor: '#7B5CFA',
          top: 0, left: offset,
        }]} />
        {/* Bottom-centre loop – violet */}
        <View style={[styles.loop, {
          width: c, height: c, borderRadius: c / 2, borderWidth: b,
          borderColor: '#9D46F5',
          top: offset, left: offset / 2,
        }]} />
      </View>

      {/* ── Text ── */}
      <View style={styles.textWrap}>
        <Text style={styles.sub}>Enterprise</Text>
        <Text style={styles.main}>Creator</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  loop: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  textWrap: {
    gap: 1,
  },
  sub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  main: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: -2,
  },
});
