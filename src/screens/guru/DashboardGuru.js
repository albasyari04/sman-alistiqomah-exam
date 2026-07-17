import { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import Svg, { Path, Circle, G, Rect } from 'react-native-svg'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { getStatsByGuru } from '../../services/resultService'
import BottomNavGuru from '../../components/BottomNavGuru'

function BellIcon() {
  return (
    <Image
      source={require('../../../assets/icons/bel-icon.png')}
      style={{ width: 35, height: 35 }}
      resizeMode="contain"
    />
  )
}

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke="#8FBF93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

function StatDocIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="#1B5E20" strokeWidth={1.6} strokeLinejoin="round"/>
      <Path d="M9 13l2 2 4-4" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

function StatPeopleIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3} stroke="#1565C0" strokeWidth={1.6}/>
      <Path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#1565C0" strokeWidth={1.6} strokeLinecap="round"/>
      <Circle cx={17} cy={9} r={2.3} stroke="#1565C0" strokeWidth={1.6}/>
      <Path d="M15.5 14.2c2.4.3 4 2 4 4.8" stroke="#1565C0" strokeWidth={1.6} strokeLinecap="round"/>
    </Svg>
  )
}

function StatCheckDocIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="#E67E22" strokeWidth={1.6} strokeLinejoin="round"/>
      <Path d="M9 11h6M9 15h4" stroke="#E67E22" strokeWidth={1.6} strokeLinecap="round"/>
    </Svg>
  )
}

function StatChartIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={12} width={3} height={7} rx={1} fill="#7E57C2"/>
      <Rect x={10.5} y={7} width={3} height={12} rx={1} fill="#7E57C2"/>
      <Rect x={16} y={3} width={3} height={16} rx={1} fill="#7E57C2"/>
    </Svg>
  )
}

function MenuPlusDocIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="#fff" strokeWidth={1.7} strokeLinejoin="round"/>
      <Path d="M12 11v6M9 14h6" stroke="#fff" strokeWidth={1.7} strokeLinecap="round"/>
    </Svg>
  )
}

function MenuClipboardIcon({ color = '#fff' }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M8 4h8a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round"/>
      <Path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" fill={color}/>
      <Path d="M9 11h6M9 14.5h6M9 18h3" stroke={color} strokeWidth={1.4} strokeLinecap="round"/>
    </Svg>
  )
}

function MenuPeopleIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3.2} stroke="#fff" strokeWidth={1.7}/>
      <Path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="#fff" strokeWidth={1.7} strokeLinecap="round"/>
      <Circle cx={17.3} cy={9} r={2.4} stroke="#fff" strokeWidth={1.7}/>
      <Path d="M15.5 14.7c2.6.3 4.5 2.2 4.5 5.3" stroke="#fff" strokeWidth={1.7} strokeLinecap="round"/>
    </Svg>
  )
}

function MenuBarChartIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={13} width={3.5} height={7} rx={1} fill="#fff"/>
      <Rect x={10.3} y={8} width={3.5} height={12} rx={1} fill="#fff"/>
      <Rect x={16.5} y={4} width={3.5} height={16} rx={1} fill="#fff"/>
    </Svg>
  )
}

function MenuBankSoalIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="#fff" strokeWidth={1.7} strokeLinejoin="round"/>
      <Path d="M9 9h6M9 12.5h6M9 16h4" stroke="#fff" strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  )
}

function MenuGearIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke="#fff" strokeWidth={1.7}/>
      <Path
        d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H10.6A1.7 1.7 0 0 0 11.6 3.5V3.4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V9.5a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z"
        stroke="#fff" strokeWidth={1.3} strokeLinejoin="round"
      />
    </Svg>
  )
}

function MegaphoneIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10v4a1 1 0 0 0 1 1h2l1 4h2l-1-4h1l9 4V5l-9 4H4a1 1 0 0 0-1 1Z" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" fill="none"/>
    </Svg>
  )
}

function HeaderGearIcon() {
  return (
    <Image
      source={require('../../../assets/icons/pengaturan-icon.png')}
      style={{ width: 30, height: 30 }}
      resizeMode="contain"
    />
  )
}

function AvatarPlaceholder({ avatarUrl }) {
  return (
    <View style={styles.avatarCircle}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
      ) : (
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={8.5} r={3.8} fill="#B8CDBB"/>
          <Path d="M4.5 20c0-4 3.4-6.8 7.5-6.8s7.5 2.8 7.5 6.8" fill="#B8CDBB"/>
        </Svg>
      )}
    </View>
  )
}

const MENU_ITEMS = [
  { key: 'buatUjian', title: 'Buat Ujian Baru', desc: 'Buat dan atur ujian untuk kelas Anda', icon: MenuPlusDocIcon, bg: '#1B5E20', route: 'BuatUjian' },
  { key: 'daftarUjian', title: 'Daftar Ujian Saya', desc: 'Lihat dan kelola semua ujian yang dibuat', icon: MenuClipboardIcon, bg: '#43A047', route: 'DaftarUjianGuru' },
  { key: 'peserta', title: 'Peserta Ujian', desc: 'Lihat daftar peserta di setiap ujian', icon: MenuPeopleIcon, bg: '#1E88E5', route: 'PesertaUjian' },
  { key: 'hasil', title: 'Hasil Ujian', desc: 'Lihat hasil dan analisis ujian peserta', icon: MenuBarChartIcon, bg: '#F39C12', route: 'HasilUjian' },
  { key: 'bankSoal', title: 'Bank Soal', desc: 'Kelola dan kelompokkan soal ujian Anda', icon: MenuBankSoalIcon, bg: '#8E44AD', route: 'BankSoal' },
  { key: 'pengumuman', title: 'Pengumuman', desc: 'Lihat dan kelola pengumuman untuk siswa', icon: MegaphoneIcon, bg: '#00897B', route: 'Pengumuman' },
]

export default function DashboardGuru({ navigation }) {
  const { profile, session } = useAuth()
  const userId = session?.user?.id

  const [statValues, setStatValues] = useState({
    totalUjianDibuat: null,
    totalPeserta: null,
    ujianSelesai: null,
    rataRataNilai: null,
  })

  const loadStats = useCallback(async () => {
    if (!userId) return
    const { data, error } = await getStatsByGuru(userId)
    if (!error && data) {
      setStatValues(data)
    } else if (error) {
      console.log('Gagal ambil statistik dashboard:', error.message)
    }
  }, [userId])

  // Ambil ulang data tiap kali layar ini difokuskan
  useFocusEffect(
    useCallback(() => {
      loadStats()
    }, [loadStats])
  )

  // Dengarkan perubahan realtime di tabel exams & results milik guru ini
  useEffect(() => {
    if (!userId) return

    const channelName = `dashboard-guru-stats-${userId}`

    // If a channel with the same name already exists (hot reload / double mount),
    // remove it first so we don't try to add callbacks after subscribe().
    try {
      if (typeof supabase.getChannels === 'function') {
        const existing = supabase.getChannels().find((c) => c && (c.topic === channelName || c.topic?.includes(channelName)))
        if (existing) supabase.removeChannel(existing)
      }
    } catch (e) {
      // ignore if API not available or removal fails
      console.log('check/remove existing channel failed', e?.message || e)
    }

    const channel = supabase.channel(channelName)
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'results' },
      () => loadStats()
    )
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'exams', filter: `created_by=eq.${userId}` },
      () => loadStats()
    )

    // subscribe after all callbacks are attached
    channel.subscribe()

    return () => {
      try {
        // unsubscribe and remove channel on cleanup
        if (channel && typeof channel.unsubscribe === 'function') channel.unsubscribe()
        supabase.removeChannel && supabase.removeChannel(channel)
      } catch (e) {
        console.log('cleanup channel failed', e?.message || e)
      }
    }
  }, [userId, loadStats])

  function fmt(value, suffix = '') {
    return value === null ? '…' : `${value}${suffix}`
  }

  const stats = [
    { label: 'Total Ujian\nDibuat', value: fmt(statValues.totalUjianDibuat), Icon: StatDocIcon },
    { label: 'Peserta\nUjian', value: fmt(statValues.totalPeserta), Icon: StatPeopleIcon },
    { label: 'Ujian\nSelesai', value: fmt(statValues.ujianSelesai), Icon: StatCheckDocIcon },
    { label: 'Rata-rata\nNilai Kelas', value: fmt(statValues.rataRataNilai, '%'), Icon: StatChartIcon },
  ]

  function goTo(routeName) {
    if (navigation?.canGoBack !== undefined && routeName) {
      navigation.navigate(routeName)
    }
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <AvatarPlaceholder avatarUrl={profile?.avatar_url} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.welcome}>Welcome</Text>
              <Text style={styles.name}>{profile?.full_name || 'Guru'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => goTo('Pengaturan')}>
              <HeaderGearIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellWrapper} onPress={() => goTo('NotifikasiSetting')}>
              <BellIcon />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          {stats.map((s, idx) => (
            <View key={s.label} style={[styles.statItem, idx !== stats.length - 1 && styles.statDivider]}>
              <View style={styles.statIconWrap}>
                <s.Icon />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Menu Utama</Text>

        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item.key} style={styles.menuCard} onPress={() => goTo(item.route)}>
              <View style={[styles.menuIconWrap, { backgroundColor: item.bg }]}>
                <item.icon />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
              <View style={styles.menuChevron}>
                <ChevronRight />
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <BottomNavGuru navigation={navigation} active="Beranda" />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F8FA' },
  scrollContent: { padding: 18, paddingTop: 18, paddingBottom: 24 },
  headerSafeArea: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#E4EFE5',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  welcome: { color: '#8A8A8A', fontSize: 13 },
  name: { color: '#1B1B1B', fontSize: 18, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIconButton: { padding: 4 },
  bellWrapper: { padding: 4 },
  bellDot: { position: 'absolute', top: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#E53935', borderWidth: 1.5, borderColor: '#F7F8FA' },

  statsCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    marginBottom: 22,
  },
  statItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  statDivider: { borderRightWidth: 1, borderRightColor: '#EEE' },
  statIconWrap: { marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1B1B1B' },
  statLabel: { fontSize: 11, color: '#8A8A8A', textAlign: 'center', marginTop: 4, lineHeight: 14 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1B1B1B', marginBottom: 12 },

  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuCard: {
    width: '48.5%', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  menuIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  menuTitle: { fontSize: 14, fontWeight: '700', color: '#1B1B1B', marginBottom: 2 },
  menuDesc: { fontSize: 11.5, color: '#8A8A8A', lineHeight: 15 },
  menuChevron: { position: 'absolute', top: 14, right: 12 },
})