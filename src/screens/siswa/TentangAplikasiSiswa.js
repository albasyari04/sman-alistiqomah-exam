import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle } from 'react-native-svg'

const COLOR_PRIMARY = '#1B5E20'
const COLOR_TEXT = '#1C2033'
const COLOR_SUBTEXT = '#8A8F9C'
const COLOR_BG = '#F4F6FA'

const APP_ICON = require('../../../assets/icons/total-ujian-icon.png')
const APP_VERSION = '1.0.0'

// ---------- Icon ----------
function IconBack({ color = COLOR_TEXT }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconChevronRight({ color = '#C3C7D1' }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconDoc({ color }) {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
      <Path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M14 3.5V8h4" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  )
}

function IconShield({ color }) {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3.5 5 6v5.5c0 4.5 3 8 7 9.5 4-1.5 7-5 7-9.5V6l-7-2.5Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconStar({ color }) {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8L12 3.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  )
}

const LINK_ITEMS = [
  { key: 'syarat', label: 'Syarat & Ketentuan', Icon: IconDoc, url: null },
  { key: 'privasi', label: 'Kebijakan Privasi', Icon: IconShield, url: null },
  { key: 'nilai', label: 'Beri Rating Aplikasi', Icon: IconStar, url: null },
]

export default function TentangAplikasiSiswa({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo & Versi */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Image source={APP_ICON} style={styles.logoImg} resizeMode="contain" />
          </View>
          <Text style={styles.appName}>E-Ujian SMA Al Istiqomah</Text>
          <Text style={styles.appVersion}>Versi {APP_VERSION}</Text>
        </View>

        {/* Deskripsi */}
        <View style={styles.descCard}>
          <Text style={styles.descText}>
            Aplikasi ujian online resmi SMA Al Istiqomah yang memudahkan siswa mengerjakan ujian, melihat
            jadwal, memantau nilai, dan mengikuti pengumuman sekolah secara digital.
          </Text>
        </View>

        {/* Link Legal */}
        <Text style={styles.sectionLabel}>Informasi Lainnya</Text>
        <View style={styles.groupCard}>
          {LINK_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.linkRow, idx < LINK_ITEMS.length - 1 && styles.linkRowBorder]}
              activeOpacity={0.7}
              onPress={() => item.url && Linking.openURL(item.url)}
            >
              <View style={styles.linkIconWrap}>
                <item.Icon color={COLOR_PRIMARY} />
              </View>
              <Text style={styles.linkLabel}>{item.label}</Text>
              <IconChevronRight />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerText}>© 2026 SMA Al Istiqomah. Semua hak dilindungi.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLOR_BG },

  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: COLOR_TEXT },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 20, marginTop: 6 },
  logoWrap: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  logoImg: { width: 46, height: 46 },
  appName: { fontSize: 16, fontWeight: '700', color: COLOR_TEXT, textAlign: 'center' },
  appVersion: { fontSize: 12, color: COLOR_SUBTEXT, marginTop: 3 },

  descCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  descText: { fontSize: 12.5, color: COLOR_SUBTEXT, lineHeight: 19, textAlign: 'center' },

  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLOR_SUBTEXT,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  linkRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F1F5' },
  linkIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#E4EFE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: { flex: 1, fontSize: 13.5, fontWeight: '700', color: COLOR_TEXT },

  footerText: { textAlign: 'center', fontSize: 11, color: '#A0A5B0', marginTop: 4 },
})