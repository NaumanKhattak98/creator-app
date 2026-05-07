import React from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable,
  TouchableOpacity, Image, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TickCircle, ArrowRight2 } from 'iconsax-react-native';
import { Colors } from '../constants/colors';
import { Workspace, WorkspaceType } from '../types';

/* ── Workspace type badge ── */
function TypeBadge({ type }: { type: WorkspaceType }) {
  const isSkills = type === 'Skills';
  const color = isSkills ? '#E07535' : '#874FE1';
  return (
    <View style={[badge.wrap, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[badge.text, { color }]}>{type}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: {
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  text: { fontSize: 12, fontWeight: '600' },
});

/* ── Main component ── */
interface Props {
  visible: boolean;
  companies: Workspace[];
  activeCompanyId: string;
  onSelect: (workspaceId: string) => void;
  onClose: () => void;
}

export default function CompanySwitcher({
  visible, companies, activeCompanyId, onSelect, onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <LinearGradient
            colors={['#0e0c20', '#110e1c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sheet}
          >
            <View style={styles.handle} />
            <Text style={styles.title}>Switch Workspace</Text>

            <FlatList
              data={companies}
              keyExtractor={(w) => w.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              renderItem={({ item }) => {
                const isActive = item.id === activeCompanyId;
                return (
                  <TouchableOpacity
                    style={[styles.row, isActive && styles.rowActive]}
                    onPress={() => { onSelect(item.id); onClose(); }}
                    activeOpacity={0.7}
                  >
                    {/* Logo */}
                    {item.logo ? (
                      <Image source={{ uri: item.logo }} style={styles.logo} />
                    ) : (
                      <View style={[styles.logo, styles.logoFallback]}>
                        <Text style={styles.logoFallbackText}>{item.name[0]}</Text>
                      </View>
                    )}

                    {/* Name + username */}
                    <View style={styles.rowText}>
                      <Text style={styles.wsName}>{item.name}</Text>
                      <Text style={styles.wsUsername}>{item.username}</Text>
                    </View>

                    {/* Type badge */}
                    <TypeBadge type={item.workspaceType} />

                    {/* Active checkmark or chevron */}
                    {isActive
                      ? <TickCircle size={18} color={Colors.primary} variant="Linear" style={{ marginLeft: 6 }} />
                      : <ArrowRight2 size={18} color={Colors.textMuted} variant="Linear" style={{ marginLeft: 6 }} />
                    }
                  </TouchableOpacity>
                );
              }}
            />

            <View style={{ height: 24 }} />
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 10,
    borderTopWidth: 1, borderColor: 'rgba(135,79,225,0.25)',
    overflow: 'hidden',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16,
  },
  title: {
    color: Colors.text, fontSize: 16, fontWeight: '700',
    textAlign: 'center', marginBottom: 8,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowActive: { backgroundColor: 'rgba(135,79,225,0.07)' },
  logo: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: Colors.surfaceMedium,
  },
  logoFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  logoFallbackText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  rowText: { flex: 1 },
  wsName: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  wsUsername: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
});
