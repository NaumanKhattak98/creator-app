import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft2, SearchNormal1 } from 'iconsax-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../../constants/colors';
import ScreenBackground from '../../../../components/ScreenBackground';
import { useAuthStore } from '../../../../store/authStore';
import { COUNTRIES } from '../../../../constants/mock';

export default function CountryScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(user?.country ?? '');

  const filtered = useMemo(
    () => COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const handleSave = () => {
    updateUser({ country: selected });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft2 size={22} color={Colors.text} variant="Linear" />
        </TouchableOpacity>
        <Text style={styles.title}>Country</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, marginTop: 8 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Search */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for Country"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          <SearchNormal1 size={20} color="rgba(255,255,255,0.4)" variant="Linear" />
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.code}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => {
            const isSelected = selected === item.name;
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => setSelected(item.name)}
                activeOpacity={0.7}
              >
                <View style={styles.flagBox}>
                  <Text style={styles.flagEmoji}>{item.flag}</Text>
                </View>
                <Text style={styles.countryName}>{item.name}</Text>
                {isSelected ? (
                  <View style={styles.radioSelected}>
                    <View style={styles.radioDotSelected} />
                  </View>
                ) : (
                  <View style={styles.radio} />
                )}
              </TouchableOpacity>
            );
          }}
        />

        {/* Save button — inside KAV so it rides up with the keyboard */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={styles.btnWrap}>
            <LinearGradient
              colors={['#874FE1', '#100D5B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              <Text style={styles.btnText}>Change Country</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08080e' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 20, fontWeight: '600', flex: 1, textAlign: 'center' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(182,182,182,0.3)',
    borderRadius: 12, paddingHorizontal: 12,
    paddingTop: 8, paddingBottom: 7,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14, paddingVertical: 0 },

  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 8 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 12, gap: 12,
  },
  flagBox: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  flagEmoji: { fontSize: 24 },
  countryName: { flex: 1, color: Colors.text, fontSize: 14 },

  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
  },
  radioSelected: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDotSelected: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary,
  },

  footer: {
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12,
    backgroundColor: '#08080e',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  btnWrap: { borderRadius: 12, overflow: 'hidden' },
  btn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
